// TODO: DOESN'T WORK.
import Discord, { ButtonStyle } from "discord.js";
const debug = process.env.DEBUG;
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  getVoiceConnection,
  AudioPlayerStatus,
} from "@discordjs/voice";
import sqlite3 from "better-sqlite3";
const masterqueue = new sqlite3("./data/queue.db");
const settings = new sqlite3("./data/settings.db");
const cache = new sqlite3("./data/instances_cache.db");

const disallowedLinks = ["https://www.youtube.com/", "https://youtu.be/"];

let timeouts = [];
let players = [];
let counters = [];
let resources = [];

function addToQueue(id, file, name, author, isLooped) {
  masterqueue
    .prepare(`INSERT INTO guild_${id} VALUES (?, ?, ?, ?)`)
    .run(file, name, author, isLooped);
}

function getHealth(id) {
  return settings
    .prepare(`SELECT * FROM guild_${id} WHERE option = 'min_health'`)
    .get().value;
}

function getFails(id) {
  return settings
    .prepare(`SELECT * FROM guild_${id} WHERE option = 'fail_threshold'`)
    .get().value;
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

function addError(instance) {
  let errors = cache
    .prepare(`SELECT * FROM instances WHERE url = '${instance}'`)
    .get().fails;
  cache
    .prepare(
      `UPDATE instances SET fails = '${errors + 1}' WHERE url = '${instance}'`,
    )
    .run();
}

async function getSuggestions(caller, url, query, retries) {
  try {
    if (retries === 4) {
      return "error";
    }
    let id = caller.guild.id;
    let instance = await InvidJS.fetchInstances({ url: url });
    let results = InvidJS.fetchSearchSuggestions(instance[0], query);
    let timeout = new Promise((res) => setTimeout(() => res("timeout"), 10000));
    const value = await Promise.race([results, timeout]);
    if (value === "timeout") {
      addError(url);
      if (debug === "true")
        console.log("[DEBUG] Could not reach instance, retrying...");
      retries++;
      url = cache
        .prepare(
          `SELECT * FROM instances WHERE health >= ${getHealth(id)} AND fails < ${getFails(id)} ORDER BY RANDOM() LIMIT 1`,
        )
        .get().url;
      if (debug === "true") console.log(`[DEBUG] New instance: ${url}`);
      await getSuggestions(url, query, retries);
    }
    return value;
  } catch (error) {
    addError(url);
    let id = caller.guild.id;
    if (debug === "true") console.log("[DEBUG] Error: " + error);
    switch (error.isFatal) {
      case false: {
        if (debug === "true")
          console.log("[DEBUG] Non-fatal instance error, retrying...");
        retries++;
        let new_url = cache
          .prepare(
            `SELECT * FROM instances WHERE health >= ${getHealth(id)} AND fails < ${getFails(id)} ORDER BY RANDOM() LIMIT 1`,
          )
          .get().url;
        if (debug === "true") console.log(`[DEBUG] New instance: ${new_url}`);
        url = url.replace(url.split("/w")[0], new_url);
        await getSuggestions(url, query, retries);
      }
      case true: {
        return undefined;
      }
    }
    return undefined;
  }
}

async function searchContent(caller, url, query, retries) {
  try {
    if (retries === 4) {
      return "error";
    }
    let id = caller.guild.id;
    let instance = await InvidJS.fetchInstances({ url: url });
    let results = InvidJS.searchContent(instance[0], query, {
      limit: 5,
    });
    let timeout = new Promise((res) => setTimeout(() => res("timeout"), 10000));
    const value = await Promise.race([results, timeout]);
    if (value === "timeout") {
      addError(url);
      if (debug === "true")
        console.log("[DEBUG] Could not reach instance, retrying...");
      retries++;
      url = cache
        .prepare(
          `SELECT * FROM instances WHERE health >= ${getHealth(id)} AND fails < ${getFails(id)} ORDER BY RANDOM() LIMIT 1`,
        )
        .get().url;
      if (debug === "true") console.log(`[DEBUG] New instance: ${url}`);
      await searchContent(url, query, retries);
    }
    return value;
  } catch (error) {
    addError(url);
    let id = caller.guild.id;
    if (debug === "true") console.log("[DEBUG] Error: " + error);
    switch (error.isFatal) {
      case false: {
        if (debug === "true")
          console.log("[DEBUG] Non-fatal instance error, retrying...");
        retries++;
        let new_url = cache
          .prepare(
            `SELECT * FROM instances WHERE health >= ${getHealth(id)} AND fails < ${getFails(id)} ORDER BY RANDOM() LIMIT 1`,
          )
          .get().url;
        if (debug === "true") console.log(`[DEBUG] New instance: ${new_url}`);
        url = url.replace(url.split("/w")[0], new_url);
        await searchContent(url, query, retries);
      }
      case true: {
        return undefined;
      }
    }
    return undefined;
  }
}

async function getVideo(url, caller, isSilent, isAnnounced, retries) {
  try {
    if (retries === 4) {
      return caller.editReply("Connection failed after 4 retries.");
    }
    let guildId = caller.guild.id;
    let id = url.split("=")[1];
    let instances = await InvidJS.fetchInstances({
      url: url.split("/w")[0],
    });
    let instance = instances[0];
    let video = InvidJS.fetchVideo(instance, url.split("=")[1], {
      type: InvidJS.FetchTypes.Full,
    });
    let timeout = new Promise((res) => setTimeout(() => res("timeout"), 10000));
    const value = await Promise.race([video, timeout]);
    if (value === "timeout") {
      addError(url.split("/w")[0]);
      if (debug === "true")
        console.log("[DEBUG] Could not reach instance, retrying...");
      retries++;
      let new_url = cache
        .prepare(
          `SELECT * FROM instances WHERE health >= ${getHealth(guildId)} AND fails < ${getFails(guildId)} ORDER BY RANDOM() LIMIT 1`,
        )
        .get().url;
      if (debug === "true") console.log(`[DEBUG] New instance: ${new_url}`);
      url = url.replace(url.split("/w")[0], new_url);
      await getVideo(url, caller, isSilent, isAnnounced, retries);
    } else {
      let format = value.formats.find(
        (format) => format.audio_quality === InvidJS.AudioQuality.Medium,
      );
      if (debug === "true")
        console.log("[DEBUG] Input valid, adding to queue...");
      addToQueue(caller.guild.id, url, value.title, caller.user.id, "false");
      if (isSilent === false) caller.channel.send(`Added ${url} to the queue!`);
      if (debug === "true") console.log("[DEBUG] Downloading stream...");
      let resource = await downloadTrack(caller, instance, value, format);
      addResource(caller.guild.id, resource, id, instance, value, format);
      if (getQueueLength(caller.guild.id) === 1) {
        if (debug === "true")
          console.log("[DEBUG] This is the first track, starting playback...");
        if (isAnnounced === true)
          announceTrack(url, caller.user.id, value, caller);
        playMusic(
          caller.member.voice.channel,
          value,
          resource,
          caller,
          isAnnounced,
        );
      }
      if (caller.replied || caller.deferred)
        return caller.editReply("Success!");
      else return caller.reply("Success!");
    }
  } catch (error) {
    addError(url.split("/w")[0]);
    let guildId = caller.guild.id;
    if (debug === "true") console.log("[DEBUG] Error: " + error);
    switch (error.isFatal) {
      case false: {
        if (debug === "true")
          console.log("[DEBUG] Non-fatal instance error, retrying...");
        retries++;
        let new_url = cache
          .prepare(
            `SELECT * FROM instances WHERE health >= ${getHealth(guildId)} AND fails < ${getFails(guildId)} ORDER BY RANDOM() LIMIT 1`,
          )
          .get().url;
        if (debug === "true") console.log(`[DEBUG] New instance: ${new_url}`);
        url = url.replace(url.split("/w")[0], new_url);
        await getVideo(url, caller, isSilent, isAnnounced, retries);
      }
      case true: {
        switch (error.code) {
          case InvidJS.ErrorCodes.APIError: {
            caller.editReply(
              "The video could not be fetched due to an API error. Please try again later.",
            );
            return undefined;
          }
          case InvidJS.ErrorCodes.InvalidContent: {
            caller.editReply(
              "This video is invalid. Please try another video.",
            );
            return undefined;
          }
          case InvidJS.ErrorCodes.BlockedVideo: {
            caller.editReply(
              "This video is blocked - perhaps it's from an auto-generated channel? Please try another video.",
            );
            return undefined;
          }
        }
      }
    }
    return undefined;
  }
}

async function getPlaylist(url, caller, retries) {
  try {
    if (retries === 4) {
      return caller.editReply("Connection failed after 4 retries.");
    }
    let instances = await InvidJS.fetchInstances({
      url: url.split("/p")[0],
    });
    let id = caller.guild.id;
    let instance = instances[0];
    let playlist = InvidJS.fetchPlaylist(instance, url.split("=")[1]);
    let timeout = new Promise((res) => setTimeout(() => res("timeout"), 10000));
    const value = await Promise.race([playlist, timeout]);
    if (value === "timeout") {
      addError(url.split("/p")[0]);
      if (debug === "true")
        console.log("[DEBUG] Could not reach instance, retrying...");
      retries++;
      let new_url = cache
        .prepare(
          `SELECT * FROM instances WHERE health >= ${getHealth(id)} AND fails < ${getFails(id)} ORDER BY RANDOM() LIMIT 1`,
        )
        .get().url;
      if (debug === "true") console.log(`[DEBUG] New instance: ${new_url}`);
      url = url.replace(url.split("/p")[0], new_url);
      await getPlaylist(url, caller, retries);
    } else {
      caller.channel.send(`Successfully added playlist to the queue!`);
      for (let i = 0; i < value.videos.length; i++) {
        const video = value.videos[i];
        let videoUrl = instance.url + "/watch?v=" + video.id;
        await getVideo(videoUrl, caller, true, true, 0);
      }
    }
  } catch (error) {
    addError(url.split("/p")[0]);
    let id = caller.guild.id;
    if (debug === "true") console.log("[DEBUG] Error: " + error);
    switch (error.isFatal) {
      case true: {
        if (debug === "true")
          console.log("[DEBUG] Non-fatal instance error, retrying...");
        retries++;
        let new_url = cache
          .prepare(
            `SELECT * FROM instances WHERE health >= ${getHealth(id)} AND fails < ${getFails(id)} ORDER BY RANDOM() LIMIT 1`,
          )
          .get().url;
        if (debug === "true") console.log(`[DEBUG] New instance: ${new_url}`);
        url = url.replace(url.split("/p")[0], new_url);
        await getPlaylist(url, caller, retries);
      }
      case false: {
        switch (error.code) {
          case InvidJS.ErrorCodes.APIError: {
            caller.editReply(
              "The playlist could not be fetched due to an API error. Please try again later.",
            );
            return undefined;
          }
          case InvidJS.ErrorCodes.InvalidContent: {
            caller.editReply(
              "This playlist is invalid. Please try another playlist.",
            );
            return undefined;
          }
        }
      }
    }
    return undefined;
  }
}

async function downloadTrack(caller, instance, video, format) {
  try {
    let blob = await InvidJS.saveStream(instance, video, format);
    return blob;
  } catch (error) {
    addError(url);
    let id = caller.guild.id;
    if (debug === "true") console.log("[DEBUG] Error: " + error);
    switch (error.isFatal) {
      case false: {
        if (debug === "true")
          console.log("[DEBUG] Non-fatal instance error, retrying...");
        let new_url = cache
          .prepare(
            `SELECT * FROM instances WHERE health >= ${getHealth(id)} AND fails < ${getFails(id)} ORDER BY RANDOM() LIMIT 1`,
          )
          .get().url;
        if (debug === "true") console.log(`[DEBUG] New instance: ${new_url}`);
        url = url.replace(url.split("/w")[0], new_url);
        await downloadTrack(caller, instance, video, format);
      }
      case true: {
        return undefined;
      }
    }
    return undefined;
  }
}

function announceTrack(url, author, video, caller) {
  let thumb = video.thumbnails.find(
    (thumbnail) => thumbnail.quality === InvidJS.ImageQuality.HD,
  ).url;
  let playingembed = new Discord.EmbedBuilder()
    .setTitle("Now Playing")
    .setDescription(
      `${video.title}\n${url}\n\nRequested by <@!${author}>\n\n` +
        "Use `/controls` to pause, stop or loop the track.",
    )
    .setImage(thumb)
    .setFooter({ text: "Powered by InvidJS - https://invidjs.js.org/" });
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
  let stream = blob.rewind();
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
      if (debug === "true") {
        console.log("[DEBUG] Starting the next track...");
      }
      let res = getResource(
        channel.guild.id,
        getFromQueue(channel.guild.id).track.split("=")[1],
      );
      if (isAnnounced === true)
        announceTrack(
          getFromQueue(channel.guild.id).track,
          getFromQueue(channel.guild.id).author,
          res.info.video,
          caller,
        );
      return playMusic(channel, res.info.video, res.track, caller, isAnnounced);
    } else {
      if (debug === "true") {
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

function addResource(id, resource, videoId, instance, video, format) {
  resources.push({
    id: id,
    track: resource,
    videoId: videoId,
    info: {
      instance: instance,
      video: video,
      format: format,
    },
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
    if (debug === "true") {
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
      if (debug === "true") {
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

export default {
  disallowedLinks,
  getSuggestions,
  searchContent,
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
  getFails,
  getHealth,
};
