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
let resources = [];

function addToQueue(id, file, author, isLooped) {
  masterqueue
    .prepare(`INSERT INTO guild_${id} VALUES (?, ?, ?)`)
    .run(file, author, isLooped);
}

function removeFromQueue(id) {
  masterqueue.prepare(`DELETE FROM guild_${id} ORDER BY rowid LIMIT 1`).run();
}

function getFromQueue(id) {
  return masterqueue
    .prepare(`SELECT rowid, * FROM guild_${id} ORDER BY rowid LIMIT 1`)
    .get();
}

function getQueueLength(id) {
  return masterqueue.prepare(`SELECT * FROM guild_${id}`).all().length;
}

async function getVideo(url, caller, isSilent, isAnnounced) {
  try {
    let id = url.split("=")[1];
    if (resources.some((resource) => resource.videoId === id)) {
      if (debug.debug === true)
        console.log(
          "[DEBUG] Resource already exists in another guild, adding the data to new resource...",
        );
      let resource = resources.find(
        (resource) => resource.videoId === id,
      ).track;
      let instances = await InvidJS.fetchInstances({
        url: url.split("/w")[0],
      });
      let instance = instances[0];
      let video = await InvidJS.fetchVideo(instance, url.split("=")[1], {
        type: InvidJS.FetchTypes.Full,
      });
      addToQueue(caller.guild.id, url, caller.author.id, "false");
      if (isSilent === false) caller.channel.send(`Added ${url} to the queue!`);
      addResource(caller.guild.id, resource, id);
      if (getQueueLength(caller.guild.id) === 1) {
        if (debug.debug === true)
          console.log("[DEBUG] This is the first track, starting playback...");
        if (isAnnounced === true)
          announceTrack(url, caller.author.id, video, caller);
        return playMusic(
          caller.member.voice.channel,
          video,
          resource,
          caller,
          isAnnounced,
        );
      }
    } else {
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
        if (debug.debug === true)
          console.log("[DEBUG] Input valid, adding to queue...");
        addToQueue(caller.guild.id, url, caller.author.id, "false");
        if (isSilent === false)
          caller.channel.send(`Added ${url} to the queue!`);
        if (debug.debug === true) console.log("[DEBUG] Downloading stream...");
        let resource = await downloadTrack(instance, video, format);
        addResource(caller.guild.id, resource, id);
        if (getQueueLength(caller.guild.id) === 1) {
          if (debug.debug === true)
            console.log(
              "[DEBUG] This is the first track, starting playback...",
            );
          if (isAnnounced === true)
            announceTrack(url, caller.author.id, video, caller);
          playMusic(
            caller.member.voice.channel,
            video,
            resource,
            caller,
            isAnnounced,
          );
        }
      } else return undefined;
    }
  } catch (error) {
    if (debug.debug === true) console.log("[DEBUG] Error: " + error);
    switch (error.code) {
      case InvidJS.ErrorCodes.APIBlocked: {
        caller.reply(
          "The video could not be fetched due to API restrictions. The instance may not support API calls or may be down.",
        );
        return undefined;
      }
      case InvidJS.ErrorCodes.APIError: {
        caller.reply(
          "The video could not be fetched due to an API error. Please try again later.",
        );
        return undefined;
      }
      case InvidJS.ErrorCodes.InvalidContent: {
        caller.reply("This video is invalid. Please try another video.");
        return undefined;
      }
      case InvidJS.ErrorCodes.BlockedVideo: {
        caller.reply(
          "This video is blocked - perhaps it's from an auto-generated channel? Please try another video.",
        );
        return undefined;
      }
    }
    return undefined;
  }
}

async function getPlaylist(url, caller) {
  try {
    let instances = await InvidJS.fetchInstances({
      url: url.split("/p")[0],
    });
    let instance = instances[0];
    let playlist = await InvidJS.fetchPlaylist(instance, url.split("=")[1]);
    caller.channel.send(
      `Successfully added ${playlist.videoCount} items to the queue!`,
    );
    for (let i = 0; i < playlist.videos.length; i++) {
      const video = playlist.videos[i];
      let videoUrl = instance.url + "/watch?v=" + video.id;
      await getVideo(videoUrl, caller, true, true);
    }
  } catch (error) {
    if (debug.debug === true) console.log("[DEBUG] Error: " + error);
    switch (error.code) {
      case InvidJS.ErrorCodes.APIBlocked: {
        caller.reply(
          "The playlist could not be fetched due to API restrictions. The instance may not support API calls or may be down.",
        );
        return undefined;
      }
      case InvidJS.ErrorCodes.APIError: {
        caller.reply(
          "The playlist could not be fetched due to an API error. Please try again later.",
        );
        return undefined;
      }
      case InvidJS.ErrorCodes.InvalidContent: {
        caller.reply("This playlist is invalid. Please try another playlist.");
        return undefined;
      }
    }
    return undefined;
  }
}

async function getVideoInfo(url) {
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
  return {
    video,
    instance,
    format,
  };
}

async function downloadTrack(instance, video, format) {
  let blob = await InvidJS.fetchSource(instance, video, format, {
    saveTo: InvidJS.SaveSourceTo.Memory,
    parts: 10,
  });
  return blob;
}

function announceTrack(url, author, video, caller) {
  let thumb = video.thumbnails.find(
    (thumbnail) => thumbnail.quality === InvidJS.ImageQuality.HD,
  ).url;
  let playingembed = new Discord.EmbedBuilder()
    .setTitle("Now Playing")
    .setDescription(video.title + "\n" + url + `\n\nRequested by <@!${author}>`)
    .setImage(thumb)
    .setFooter({ text: "Powered by InvidJS" });
  caller.channel.send({ embeds: [playingembed] });
}

function playMusic(channel, video, blob, caller, isAnnounced) {
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
      video: video,
      time: 0,
      isPaused: false,
    });
  } else {
    player = getPlayer(channel.guild.id).player;
  }
  let stream = blob.stream();
  let resource = createAudioResource(stream, {
    inputType: stream.type,
  });
  player.play(resource);
  startCounter(channel.guild.id);
  player.on(AudioPlayerStatus.Idle, () => {
    stopCounter(channel.guild.id);
    removePlayer(channel.guild.id);
    if (getFromQueue(channel.guild.id).isLooped === "false") {
      removeFromQueue(channel.guild.id);
    }
    if (getQueueLength(channel.guild.id) > 0) {
      return getVideoInfo(getFromQueue(channel.guild.id).track).then((info) => {
        let res = getResource(channel.guild.id, info.video.id);
        if (isAnnounced === true)
          announceTrack(
            getFromQueue(channel.guild.id).track,
            getFromQueue(channel.guild.id).author,
            info.video,
            caller,
          );
        playMusic(channel, info.video, res.track, caller, isAnnounced);
      });
    } else {
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
      return startTimeout(
        channel.guild.id,
        connection,
        caller.channel,
        timeout,
      );
    }
  });
}

function addResource(id, resource, videoId) {
  resources.push({
    id: id,
    track: resource,
    videoId: videoId,
  });
}

function getResource(id, videoId) {
  let found = undefined;
  resources.forEach((track) => {
    if (track.id === id && track.videoId === videoId) {
      found = track;
    }
  });
  return found;
}

function removeResource(id, videoId) {
  resources.forEach((track) => {
    if (track.id === id && track.videoId === videoId) {
      resources.splice(resources.indexOf(track), 1);
    }
  });
}

function clearCache(id) {
  resources.forEach((track) => {
    if (track.id === id) {
      resources.splice(resources.indexOf(track), 1);
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
    settings
      .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
      .run("queue", "music_mode");
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
  addToQueue,
  removeFromQueue,
  getFromQueue,
  getQueueLength,
  downloadTrack,
  addResource,
  getResource,
  removeResource,
  clearCache,
};
