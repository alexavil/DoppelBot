const InvidJS = require("@invidjs/invid-js");
const Discord = require("discord.js");
const debug = require("./index");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  getVoiceConnection,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const sqlite3 = require("better-sqlite3");
const masterqueue = new sqlite3("./data/queue.db");
const settings = new sqlite3("./data/settings.db");

const disallowedLinks = ["https://www.youtube.com/", "https://youtu.be/"];

let timeouts = [];
let players = [];
let counters = [];

async function getVideo(url, textchannel) {
  try {
    let instances = await InvidJS.fetchInstances({
      url: url.split("/w")[0],
    });
    let instance = instances[0];
    let video = await InvidJS.fetchVideo(instance, url.split("=")[1], {
      type: InvidJS.FetchTypes.Full,
    });
    let format = video.formats.find(
      (format) => format.audio_quality === InvidJS.AudioQuality.Medium,
    );
    let isValid = undefined;
    isValid = await InvidJS.validateSource(instance, video, format);
    if (isValid === true) {
      let result = {
        url,
        instance,
        video,
        format,
      };
      return result;
    } else return undefined;
  } catch (error) {
    if (debug.debug === true) console.log("[DEBUG] Error: " + error);
    switch (error.code) {
      case InvidJS.ErrorCodes.APIBlocked: {
        textchannel.send(
          "The video could not be fetched due to API restrictions. The instance may not support API calls or may be down.",
        );
        return undefined;
      }
      case InvidJS.ErrorCodes.APIError: {
        textchannel.send(
          "The video could not be fetched due to an API error. Please try again later.",
        );
        return undefined;
      }
      case InvidJS.ErrorCodes.InvalidContent: {
        textchannel.send("This video is invalid. Please try another video.");
        return undefined;
      }
      case InvidJS.ErrorCodes.BlockedVideo: {
        textchannel.send(
          "This video is blocked - perhaps it's from an auto-generated channel? Please try another video.",
        );
        return undefined;
      }
    }
    return undefined;
  }
}

async function getPlaylist(url, textchannel) {
  try {
    let instances = await InvidJS.fetchInstances({
      url: url.split("/p")[0],
    });
    let instance = instances[0];
    let playlist = await InvidJS.fetchPlaylist(instance, url.split("=")[1]);
    let result = {
      url,
      instance,
      playlist,
    };
    return result;
  } catch (error) {
    if (debug.debug === true) console.log("[DEBUG] Error: " + error);
    switch (error.code) {
      case InvidJS.ErrorCodes.APIBlocked: {
        textchannel.send(
          "The playlist could not be fetched due to API restrictions. The instance may not support API calls or may be down.",
        );
        return undefined;
      }
      case InvidJS.ErrorCodes.APIError: {
        textchannel.send(
          "The playlist could not be fetched due to an API error. Please try again later.",
        );
        return undefined;
      }
      case InvidJS.ErrorCodes.InvalidContent: {
        textchannel.send(
          "This playlist is invalid. Please try another playlist.",
        );
        return undefined;
      }
    }
    return undefined;
  }
}

function playMusic(channel, textchannel, stream, fetched) {
  let connection = undefined;
  if (getVoiceConnection(channel.guild.id) === undefined) {
    connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });
  } else connection = getVoiceConnection(channel.guild.id);
  let player = undefined;
  if (getPlayer(channel.guild.id) === undefined) {
    player = createAudioPlayer();
    let subscription = connection.subscribe(player);
    players.push({
      id: channel.guild.id,
      player: player,
      subscription: subscription,
      video: fetched.video,
      time: 0,
      isPaused: false,
    });
  } else {
    player = getPlayer(channel.guild.id).player;
  }
  const resource = createAudioResource(stream, {
    inputType: stream.type,
  });
  player.play(resource);
  startCounter(channel.guild.id);
  player.on(AudioPlayerStatus.Idle, async () => {
    stopCounter(channel.guild.id);
    removePlayer(channel.guild.id);
    if (
      masterqueue
        .prepare(
          `SELECT * FROM guild_${channel.guild.id} ORDER BY ROWID LIMIT 1`,
        )
        .get().isLooped === "true"
    ) {
      if (debug.debug === true) {
        console.log("[DEBUG] Restarting a looped track...");
      }
      let stream = await InvidJS.fetchSource(
        fetched.instance,
        fetched.video,
        fetched.format,
        { saveTo: InvidJS.SaveSourceTo.Memory, parts: 5 },
      );
      return playMusic(channel, textchannel, stream, fetched);
    } else {
      if (debug.debug === true) {
        console.log("[DEBUG] The current track is over, removing...");
      }
      masterqueue
        .prepare(`DELETE FROM guild_${channel.guild.id} LIMIT 1`)
        .run();
      let track = masterqueue
        .prepare(
          `SELECT * FROM guild_${channel.guild.id} ORDER BY ROWID LIMIT 1`,
        )
        .get();
      if (track === undefined) {
        if (debug.debug === true) {
          console.log("[DEBUG] No more tracks to play, starting timeout...");
        }
        let timeout =
          parseInt(
            settings
              .prepare(
                `SELECT * FROM guild_${channel.guild.id} WHERE option = 'disconnect_timeout'`,
              )
              .get().value,
          ) * 1000;
        startTimeout(channel.guild.id, connection, textchannel, timeout);
      } else {
        if (debug.debug === true) {
          console.log("[DEBUG] Loading the next track...");
        }
        let new_track = await getVideo(track.track, textchannel);
        let stream = await InvidJS.fetchSource(
          new_track.instance,
          new_track.video,
          new_track.format,
          { saveTo: InvidJS.SaveSourceTo.Memory, parts: 5 },
        );

        let thumb = new_track.video.thumbnails.find(
          (thumbnail) => thumbnail.quality === InvidJS.ImageQuality.HD,
        ).url;
        let playingembed = new Discord.EmbedBuilder()
          .setTitle("Now Playing")
          .setDescription(
            `${new_track.video.title}\n${new_track.url}\n\nRequested by <@!${track.author}>`,
          )
          .setImage(thumb)
          .setFooter({ text: "Powered by InvidJS" });
        textchannel.send({ embeds: [playingembed] });
        return playMusic(channel, textchannel, stream, new_track);
      }
    }
  });
}

function startCounter(id) {
  let counter = setInterval(() => {
    let player = getPlayer(id);
    if (player.isPaused === false) {
      player.time++;
    }
  }, 1000);
  counters.push({
    id: id,
    counter: counter,
  });
}

function stopCounter(id) {
  counters.forEach((counter) => {
    if (counter.id === id) {
      getPlayer(id).time = 0;
      clearInterval(counter.counter);
      counters.splice(counters.indexOf(counter), 1);
    }
  });
}

function startTimeout(id, connection, textchannel, timer) {
  let timeout = setTimeout(() => {
    if (debug.debug === true) {
      console.log("[DEBUG] Stopping music...");
    }
    connection.destroy();
    endTimeout(id);
    textchannel.send(`No more tracks to play, disconnecting!`);
  }, timer);
  timeouts.push({
    id: id,
    timer: timeout,
  });
}

function endTimeout(id) {
  timeouts.forEach((timeout) => {
    if (timeout.id === id) {
      if (debug.debug === true) {
        console.log("[DEBUG] Clearing timeout...");
      }
      clearTimeout(timeout.timer);
      timeouts.splice(timeouts.indexOf(timeout), 1);
    }
  });
}

function getPlayer(id) {
  let found = undefined;
  players.forEach((player) => {
    if (player.id === id) {
      found = player;
    }
  });
  return found;
}

function removePlayer(id) {
  players.forEach((player) => {
    if (player.id === id) {
      return players.splice(players.indexOf(player), 1);
    }
  });
}

module.exports = {
  disallowedLinks,
  getVideo,
  getPlaylist,
  playMusic,
  startCounter,
  stopCounter,
  startTimeout,
  endTimeout,
  getPlayer,
  removePlayer,
};
