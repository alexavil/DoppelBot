const Discord = require("discord.js");
const InvidJS = require("@invidjs/invid-js");
const debug = require("../index");
const {
  AudioPlayerStatus,
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  NoSubscriberBehavior,
} = require("@discordjs/voice");
const sqlite3 = require("better-sqlite3");

const settings = new sqlite3("./data/settings.db");
const masterqueue = new sqlite3("./data/queue.db");
let timerId = undefined;
let isPaused = false;
let player = undefined;
let disallowedLinks = ["https://www.youtube.com/", "https://youtu.be/"];

module.exports = {
  name: "music",
  description: "Music control",
  aliases: ["m"],
  async execute(message, args) {
    const id = message.guild.id;
    let url = "";
    let channel = message.member.voice.channel;
    let default_url = settings
      .prepare(`SELECT * FROM guild_${id} WHERE option = 'default_instance'`)
      .get().value;
    let min_health = settings
      .prepare(
        `SELECT * FROM guild_${id} WHERE option = 'instance_health_threshold'`
      )
      .get().value;

    async function getPlaylist(url) {
      if (debug.debug === true)
        console.log("[DEBUG] Validating url " + url + "...");
      try {
        let instance = await InvidJS.fetchInstances({
          url: url.split("/p")[0],
        });
        if (instance[0].health < min_health) {
          if (debug.debug === true)
            console.log(
              "[DEBUG] Provided instance health is low, sending a warning..."
            );
          message.channel.send(
            "WARNING: Instance health is low. Please consider selecting a different instance."
          );
        }
        let queuelength = masterqueue
          .prepare(`SELECT * FROM guild_${id}`)
          .all().length;
        let playlist = await InvidJS.fetchPlaylist(
          instance[0],
          url.split("=")[1]
        );
        playlist.videos.forEach((video) => {
          masterqueue
            .prepare(`INSERT INTO guild_${id} VALUES (?, ?, ?)`)
            .run(
              url.split("/p")[0] + "/watch?v=" + video.id,
              message.author.id,
              "false"
            );
        });
        message.reply("Playlist added to queue!");
        if (queuelength === 0) {
          if (debug.debug === true)
            console.log("[DEBUG] Queue is empty, starting playback...");
          return playmusic(
            channel,
            url.split("/p")[0] + "/watch?v=" + playlist.videos[0].id,
            message.author.id
          );
        }
      } catch (error) {
        if (debug.debug === true)
          console.log("[DEBUG] Error: " + error + "...");
        switch (error.code) {
          case InvidJS.ErrorCodes.APIBlocked: {
            message.reply(
              "The playlist could not be fetched due to API restrictions. The instance may not support API calls or may be down."
            );
            return undefined;
          }
          case InvidJS.ErrorCodes.APIError: {
            message.reply(
              "The playlist could not be fetched due to an API error. Please try again later."
            );
            return undefined;
          }
          case InvidJS.ErrorCodes.InvalidContent: {
            message.reply(
              "This playlist is invalid. Please try another playlist."
            );
            return undefined;
          }
        }
        return undefined;
      }
    }

    async function streamCheck(url) {
      if (debug.debug === true)
        console.log("[DEBUG] Validating url " + url + "...");
      let stream = undefined;
      try {
        let instance = await InvidJS.fetchInstances({
          url: url.split("/w")[0],
        });
        if (instance[0].health < min_health) {
          if (debug.debug === true)
            console.log(
              "[DEBUG] Provided instance health is low, sending a warning..."
            );
          message.channel.send(
            "WARNING: Instance health is low. Please consider selecting a different instance."
          );
        }
        let video = await InvidJS.fetchVideo(instance[0], url.split("=")[1]);
        let format = video.formats.find(
          (format) => format.quality === "AUDIO_QUALITY_MEDIUM"
        );
        stream = await InvidJS.fetchSource(instance[0], video, format, {
          saveTo: InvidJS.SaveSourceTo.Memory,
          parts: 5,
        });
      } catch (error) {
        if (debug.debug === true)
          console.log("[DEBUG] Error: " + error + "...");
        switch (error.code) {
          case InvidJS.ErrorCodes.APIBlocked: {
            message.reply(
              "The video could not be fetched due to API restrictions. The instance may not support API calls or may be down."
            );
            return undefined;
          }
          case InvidJS.ErrorCodes.APIError: {
            message.reply(
              "The video could not be fetched due to an API error. Please try again later."
            );
            return undefined;
          }
          case InvidJS.ErrorCodes.BlockedVideo: {
            message.reply(
              "This video is blocked - perhaps it's from an auto-generated channel? Please try another video."
            );
            return undefined;
          }
          case InvidJS.ErrorCodes.InvalidContent: {
            message.reply("This video is invalid. Please try another video.");
            return undefined;
          }
        }
        return undefined;
      }
      return stream;
    }

    async function setupQueue(url) {
      if (debug.debug === true)
        console.log("[DEBUG] Adding url " + url + " to queue...");
      let stream = await streamCheck(url);
      if (stream === undefined) return false;
      masterqueue
        .prepare(`INSERT INTO guild_${id} VALUES (?, ?, ?)`)
        .run(url, message.author.id, "false");
      if (masterqueue.prepare(`SELECT * FROM guild_${id}`).all().length === 1) {
        if (debug.debug === true)
          console.log(
            "[DEBUG] This is the only track in the queue, starting playback..."
          );
        playmusic(channel, url, message.author.id);
      } else {
        message.channel.send("Added " + url + " to queue!");
      }
    }

    async function playmusic(channel, url, author) {
      let stream = await streamCheck(url);
      if (stream === undefined) return false;
      if (debug.debug === true) console.log("[DEBUG] Creating connection...");
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Pause,
        },
      });
      if (debug.debug === true) {
        console.log("[DEBUG] Connection created, activating debug mode...");
        connection.on("debug", console.log);
      }
      if (debug.debug === true)
        console.log("[DEBUG] Creating player and resource...");
      player = createAudioPlayer();
      const resource = createAudioResource(stream, {
        inputType: stream.type,
      });
      message.channel.send(`Now playing: ${url}\nRequested by <@!${author}>`);
      player.play(resource);
      connection.subscribe(player);
      if (timerId !== undefined) clearTimeout(timerId);
      player.on(AudioPlayerStatus.Idle, () => {
        if (debug.debug === true)
          console.log("[DEBUG] Player idle, checking the queue...");
        if (
          masterqueue
            .prepare(`SELECT * FROM guild_${id} ORDER BY ROWID LIMIT 1`)
            .get().isLooped === "true"
        ) {
          if (debug.debug === true)
            console.log("[DEBUG] The current track is looped, restarting...");
          let track = masterqueue
            .prepare(`SELECT * FROM guild_${id} ORDER BY ROWID LIMIT 1`)
            .get();
          return playmusic(channel, track.track, track.author);
        }
        masterqueue
          .prepare(`DELETE FROM guild_${id} ORDER BY ROWID LIMIT 1`)
          .run();
        let track = masterqueue
          .prepare(`SELECT * FROM guild_${id} ORDER BY ROWID LIMIT 1`)
          .get();
        if (track || track != undefined) {
          if (debug.debug === true)
            console.log("[DEBUG] Queue not empty, continuing playback...");
          playmusic(channel, track.track, track.author);
        } else {
          if (debug.debug === true)
            console.log("[DEBUG] Queue empty, starting timer...");
          timerId = setTimeout(() => {
            message.channel.send("No more tracks to play, disconnecting!");
            if (connection) connection.destroy();
          }, parseInt(settings.prepare(`SELECT * FROM guild_${id} WHERE option = 'disconnect_timeout'`).get().value) * 1000);
        }
      });
    }

    async function sendEmbed(results) {
      let searchembed = new Discord.EmbedBuilder();
      results.forEach((track) => {
        searchembed.addFields({
          name: track.title,
          value: default_url + "/watch?v=" + track.id,
          inline: false,
        });
      });
      searchembed.setTitle("Please select a track:");
      searchembed.setColor("#0099ff");
      let embedmessage = await message.channel.send({
        embeds: [searchembed],
      });
      embedmessage.react(`1️⃣`);
      embedmessage.react(`2️⃣`);
      embedmessage.react(`3️⃣`);
      embedmessage.react(`4️⃣`);
      embedmessage.react(`5️⃣`);
      const filter = (reaction, user) =>
        reaction.emoji.name === `1️⃣` ||
        reaction.emoji.name === `2️⃣` ||
        reaction.emoji.name === `3️⃣` ||
        reaction.emoji.name === `4️⃣` ||
        (reaction.emoji.name === `5️⃣` && user.id === message.author.id);
      let choice = 0;
      embedmessage
        .awaitReactions({ filter, maxUsers: 2 })
        .then((collected) =>
          collected.forEach((emoji) => {
            if (emoji.count > 1) {
              if (debug.debug === true)
                console.log("[DEBUG] User choice: " + choice + "...");
              videoid = results[choice].id;
              setupQueue(default_url + "/watch?v=" + videoid);
            } else {
              choice++;
            }
          })
        )
        .catch();
    }

    if (args.length === 0) {
      return message.reply("Provide a command!");
    }
    if (!channel) {
      return message.reply("You must be in a voice channel!");
    }
    switch (args[0]) {
      case "play":
      case "p": {
        if (debug.debug === true)
          console.log("[DEBUG] Starting playback for " + id + "...");
        if (!args[1]) {
          return message.reply("Provide a valid link!");
        }
        url = args[1];
        if (disallowedLinks.some((link) => url.startsWith(link))) {
          if (debug.debug === true)
            console.log("[DEBUG] YouTube link detected, redirecting...");
          message.channel.send(
            "Due to migration to InvidJS, the content will be played using the default Invidious instance for this server."
          );
          if (url.includes("/watch?v=")) {
            url = default_url + "/watch?v=" + url.split("=")[1];
          }
          if (url.includes("/playlist?list=")) {
            url = default_url + "/playlist?list=" + url.split("=")[1];
          }
        }
        if (url.match(/[a-zA-Z0-9_-]{11}/) && url.length === 11) {
          if (debug.debug === true)
            console.log("[DEBUG] ID detected, using default instance...");
          message.channel.send(
            "Your track will be played using the default Invidious instance for this server."
          );
          url = default_url + "/watch?v=" + url;
        }
        if (url.includes("/watch?v=")) setupQueue(url);
        if (url.includes("/playlist?list=")) getPlaylist(url);
        break;
      }
      case "stop": {
        if (debug.debug === true)
          console.log(
            "[DEBUG] Trying to stop the VC connection for " + id + "..."
          );
        if (
          !message.channel
            .permissionsFor(message.author)
            .has(Discord.PermissionsBitField.Flags.BanMembers) &&
          masterqueue
            .prepare(
              `SELECT * FROM guild_${id} WHERE author = ${message.author.id}`
            )
            .all().length === 0 &&
          channel.members.size !== 2
        ) {
          return message.reply("You are not allowed to stop!");
        }
        const connection = getVoiceConnection(channel.guild.id);
        if (connection) connection.destroy();
        else return message.channel.send("The bot is already stopped!");
        masterqueue.prepare(`DELETE FROM guild_${id}`).run();
        message.channel.send("Stopped!");
        break;
      }
      case "suggest": {
        if (debug.debug === true)
          console.log("[DEBUG] Starting suggestions for " + id + "...");
        if (!args[1]) {
          if (debug.debug === true)
            console.log("[DEBUG] Invalid input, aborting...");
          return message.reply("Provide a valid query!");
        }
        let query = args.slice(1).join(" ");
        if (debug.debug === true) {
          console.log("[DEBUG] User query: " + query + "...");
          console.log("[DEBUG] Fetching suggestions...");
        }
        let instance = await InvidJS.fetchInstances({ url: default_url });
        let results = await InvidJS.fetchSearchSuggestions(instance[0], query);
        if (!results.length) {
          if (debug.debug === true)
            console.log("[DEBUG] No content was found...");
          return message.reply(
            "No suggestions were found based on your search query!"
          );
        }
        let result = "Suggestions for `" + query + "`:";
        results.forEach((suggestion) => {
          result += "\n`" + suggestion + "`";
        });
        return message.channel.send(result);
      }
      case "search":
        {
          if (debug.debug === true)
            console.log("[DEBUG] Starting search for " + id + "...");
          if (!args[1]) {
            if (debug.debug === true)
              console.log("[DEBUG] Invalid input, aborting...");
            return message.reply("Provide a valid search query!");
          }
          let query = args.slice(1).join(" ");
          if (debug.debug === true) {
            console.log("[DEBUG] User query: " + query + "...");
            console.log("[DEBUG] Searching...");
          }
          let instance = await InvidJS.fetchInstances({ url: default_url });
          let results = await InvidJS.searchContent(instance[0], query, {
            limit: 5,
          });
          if (!results.length) {
            if (debug.debug === true)
              console.log("[DEBUG] No content was found...");
            return message.reply(
              "No content was found based on your search query!"
            );
          }
          sendEmbed(results);
        }
        break;
      case "queue":
      case "q": {
        if (debug.debug === true)
          console.log("[DEBUG] Requesting queue for " + id + "...");
        let embed = new Discord.EmbedBuilder();
        let queuelength = masterqueue
          .prepare(`SELECT * FROM guild_${id}`)
          .all().length;
        if (queuelength !== 0) {
          masterqueue
            .prepare(`SELECT * FROM guild_${id}`)
            .all()
            .forEach((track) => {
              embed.addFields({
                name: track.track,
                value: `Requested by: <@!${track.author}>`,
                inline: true,
              });
            });
        } else {
          embed.setDescription("The queue is empty!");
        }
        embed.setTitle("Queue");
        embed.setColor("#0099ff");
        message.channel.send({ embeds: [embed] });
        break;
      }
      case "skip":
      case "s": {
        if (debug.debug === true)
          console.log("[DEBUG] Trying to skip a track for " + id + "...");
        const connection = getVoiceConnection(channel.guild.id);
        if (!connection) return message.channel.send("Nothing to skip!");
        if (
          !message.channel
            .permissionsFor(message.author)
            .has(Discord.PermissionsBitField.Flags.BanMembers) &&
          masterqueue
            .prepare(
              `SELECT * FROM guild_${id} WHERE author = ${message.author.id}`
            )
            .all().length === 0 &&
          channel.members.size !== 2
        ) {
          return message.reply("You are not allowed to skip!");
        }
        if (
          masterqueue
            .prepare(`SELECT * FROM guild_${id} ORDER BY ROWID LIMIT 1`)
            .get().isLooped === "true"
        ) {
          masterqueue
            .prepare(`UPDATE guild_${id} SET isLooped = 'false' LIMIT 1`)
            .run();
        }
        player.stop();
        message.channel.send("Skipped!");
        break;
      }
      case "loop": {
        if (debug.debug === true)
          console.log("[DEBUG] Loop requested for " + id + "...");
        switch (
          masterqueue
            .prepare(`SELECT * FROM guild_${id} ORDER BY ROWID LIMIT 1`)
            .get().isLooped
        ) {
          case "true": {
            masterqueue
              .prepare(`UPDATE guild_${id} SET isLooped = 'false' LIMIT 1`)
              .run();
            return message.reply("The current track will not be looped!");
          }
          case "false": {
            masterqueue
              .prepare(`UPDATE guild_${id} SET isLooped = 'true' LIMIT 1`)
              .run();
            return message.reply("The current track will be looped!");
          }
        }
      }
      case "pause": {
        if (debug.debug === true)
          console.log("[DEBUG] Trying to pause for " + id + "...");
        const connection = getVoiceConnection(channel.guild.id);
        if (!connection) return message.channel.send("Nothing to pause!");
        switch (isPaused) {
          case true: {
            if (debug.debug === true) console.log("[DEBUG] Unpausing...");
            player.unpause();
            isPaused = false;
            return message.channel.send("Unpaused!");
          }
          case false: {
            if (debug.debug === true) console.log("[DEBUG] Pausing...");
            player.pause();
            isPaused = true;
            return message.channel.send("Paused!");
          }
        }
      }
    }
  },
};
