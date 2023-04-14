const InvidJS = require("@invidjs/invid-js");
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

async function getVideo(url) {
  let instances = await InvidJS.fetchInstances({
    url: url.split("/w")[0],
  });
  let instance = instances[0];
  let video = await InvidJS.fetchVideo(instance, url.split("=")[1]);
  let format = video.formats.find(
    (format) => format.quality === InvidJS.AudioQuality.Medium
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
}

async function getPlaylist(url) {
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
  let player = createAudioPlayer();
  const resource = createAudioResource(stream, {
    inputType: stream.type,
  });
  player.play(resource);
  connection.subscribe(player);
  player.on(AudioPlayerStatus.Idle, async () => {
    if (
      masterqueue
        .prepare(
          `SELECT * FROM guild_${channel.guild.id} ORDER BY ROWID LIMIT 1`
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
        { saveTo: InvidJS.SaveSourceTo.Memory, parts: 10 }
      );
      playMusic(channel, textchannel, stream, fetched);
    } else {
      if (debug.debug === true) {
        console.log("[DEBUG] The current track is over, removing...");
      }
      masterqueue
        .prepare(`DELETE FROM guild_${channel.guild.id} LIMIT 1`)
        .run();
      let track = masterqueue
        .prepare(
          `SELECT * FROM guild_${channel.guild.id} ORDER BY ROWID LIMIT 1`
        )
        .get();
      if (track === undefined) {
        if (debug.debug === true) {
          console.log("[DEBUG] No more tracks to play, starting timeout...");
        }
        let timeout = parseInt(settings.prepare(`SELECT * FROM guild_${channel.guild.id} WHERE option = 'disconnect_timeout'`).get().value) * 1000;
        startTimeout(channel.guild.id, connection, textchannel, timeout);
      } else {
        if (debug.debug === true) {
          console.log("[DEBUG] Loading the next track...");
        }
        let new_track = await getVideo(track.track);
        let stream = await InvidJS.fetchSource(
          new_track.instance,
          new_track.video,
          new_track.format,
          { saveTo: InvidJS.SaveSourceTo.Memory, parts: 10 }
        );
        playMusic(channel, textchannel, stream, new_track);
        textchannel.send(
          `Now playing: ${track.track}\nRequested by <@!${track.author}>`
        );
      }
    }
  });
}

function startTimeout(id, connection, textchannel, timer) {
  let timeout = setTimeout(() => {
    if (debug.debug === true) {
      console.log("[DEBUG] Stopping music...");
    }
    connection.destroy();
    textchannel.send(`No more tracks to play, disconnecting!`);
  }, timer);
  timeouts.push([id, timeout]);
}

function endTimeout(id) {
  timeouts.forEach((timeout) => {
    if (timeout[0] === id) {
      if (debug.debug === true) {
        console.log("[DEBUG] A new track has been added, clearing timeout...");
      }
      clearTimeout(timeout[1]);
    }
  });
}

module.exports = {
  disallowedLinks,
  getVideo,
  getPlaylist,
  playMusic,
  startTimeout,
  endTimeout,
};
