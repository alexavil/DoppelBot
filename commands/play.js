const InvidJS = require("@invidjs/invid-js");
const Discord = require("discord.js");
const debug = require("../index");
const common = require("../music");
const sqlite3 = require("better-sqlite3");

const masterqueue = new sqlite3("./data/queue.db");
const settings = new sqlite3("./data/settings.db");
module.exports = {
  name: "play",
  aliases: ["p"],
  description: "Play a track",
  async execute(message, args) {
    const id = message.guild.id;
    if (!message.member.voice.channel) {
      if (debug.debug === true)
        console.log("[DEBUG] No voice channel found, aborting...");
      return message.reply("You need to join a voice channel first!");
    }
    if (!args[0]) {
      if (debug.debug === true)
        console.log("[DEBUG] Invalid input, aborting...");
      return message.reply("Provide a valid link!");
    }
    let default_url = settings
      .prepare(`SELECT * FROM guild_${id} WHERE option = 'default_instance'`)
      .get().value;
    let min_health = settings
      .prepare(`SELECT * FROM guild_${id} WHERE option = 'min_health'`)
      .get().value;
    let notifications = settings
      .prepare(`SELECT * FROM guild_${id} WHERE option = 'notifications'`)
      .get().value;
    url = args[0];
    if (common.disallowedLinks.some((link) => url.startsWith(link))) {
      if (debug.debug === true)
        console.log("[DEBUG] YouTube link detected, redirecting...");
      if (notifications === "true")
        message.channel.send(
          "Due to migration to InvidJS, the content will be played using the default Invidious instance for this server."
        );
      if (url.includes("/watch?v=")) {
        url = default_url + "/watch?v=" + url.split("=")[1];
      }
      if (url.includes("/playlist?list=")) {
        url = default_url + "/playlist?list=" + url.split("=")[1];
      }
      if (url.startsWith("https://youtu.be/")) {
        url = default_url + "/watch?v=" + url.split("e/")[1];
      }
    }
    if (url.match(/[a-zA-Z0-9_-]{11}/) && url.length === 11) {
      if (debug.debug === true)
        console.log("[DEBUG] ID detected, redirecting to default instance...");
      message.channel.send(
        "Your track will be played using the default Invidious instance for this server."
      );
      url = default_url + "/watch?v=" + url;
    }
    common.endTimeout(id);
    if (debug.debug === true) console.log("[DEBUG] Validating " + url + "...");
    if (url.includes("/watch?v=")) {
      let fetched = await common.getVideo(url, message.channel);
      let queuelength = masterqueue
        .prepare(`SELECT * FROM guild_${id}`)
        .all().length;
      if (fetched !== undefined) {
        if (fetched.instance.health < min_health) {
          if (debug.debug === true)
            console.log(
              "[DEBUG] Instance not healthy enough, sending a warning..."
            );
          message.channel.send(
            "ALERT: Instance health too low. Please consider using a different instance."
          );
        }
        if (debug.debug === true)
          console.log("[DEBUG] Adding " + url + " to the queue...");
        masterqueue
          .prepare(`INSERT INTO guild_${id} VALUES (?, ?, ?)`)
          .run(url, message.author.id, "false");
        if (queuelength === 0) {
          if (debug.debug === true) {
            console.log("[DEBUG] Starting the first track...");
            console.log("[DEBUG] Downloading stream...");
          }
          let stream = await InvidJS.fetchSource(
            fetched.instance,
            fetched.video,
            fetched.format,
            { saveTo: InvidJS.SaveSourceTo.Memory, parts: 5 }
          );
          if (debug.debug === true) console.log("[DEBUG] Creating player...");
          let thumb = fetched.video.thumbnails.find(
            (thumbnail) => thumbnail.quality === InvidJS.ImageQuality.HD
          ).url;
          let playingembed = new Discord.EmbedBuilder()
            .setTitle("Now Playing")
            .setDescription(fetched.video.title + "\n" + fetched.url + `\n\nRequested by <@!${message.author.id}>`)
            .setImage(thumb)
            message.channel.send({embeds: [playingembed]});
          common.playMusic(
            message.member.voice.channel,
            message.channel,
            stream,
            fetched
          );
        } else {
          message.reply(`Added ${fetched.url} to the queue!`);
        }
      }
    }
    if (url.includes("/playlist?list=")) {
      let fetched = await common.getPlaylist(url);
      let queuelength = masterqueue
        .prepare(`SELECT * FROM guild_${id}`)
        .all().length;
      if (fetched !== undefined) {
        if (fetched.instance.health < min_health) {
          if (debug.debug === true)
            console.log(
              "[DEBUG] Instance not healthy enough, sending a warning..."
            );
          message.channel.send(
            "ALERT: Instance health too low. Please consider using a different instance."
          );
        }
        if (debug.debug === true)
          console.log("[DEBUG] Adding tracks from " + url + " to the queue...");
        let statement = masterqueue.prepare(
          `INSERT INTO guild_${id} VALUES (?, ?, ?)`
        );
        let transaction = masterqueue.transaction(() => {
          fetched.playlist.videos.forEach((video) => {
            statement.run(
              fetched.instance.url + "/watch?v=" + video.id,
              message.author.id,
              "false"
            );
          });
        });
        transaction();
        message.reply("Successfully added " + fetched.playlist.videoCount + " items to the queue!");
        if (queuelength === 0) {
          if (debug.debug === true)
            console.log("[DEBUG] Starting the first track...");
          let first = masterqueue
            .prepare(`SELECT * FROM guild_${id} ORDER BY ROWID LIMIT 1`)
            .get();
          if (debug.debug === true)
            console.log("[DEBUG] Validating " + first.track + "...");
          let vid = await common.getVideo(first.track, message.channel);
          if (debug.debug === true)
            console.log("[DEBUG] Downloading stream...");
          let stream = await InvidJS.fetchSource(
            vid.instance,
            vid.video,
            vid.format,
            { saveTo: InvidJS.SaveSourceTo.Memory, parts: 5 }
          );
          if (debug.debug === true) console.log("[DEBUG] Creating player...");
          let thumb = vid.video.thumbnails[0].url;
          let playingembed = new Discord.EmbedBuilder()
            .setTitle("Now Playing")
            .setDescription(vid.video.title + "\n" + vid.url + `\n\nRequested by <@!${message.author.id}>`)
            .setImage(thumb)
            message.channel.send({embeds: [playingembed]});
          common.playMusic(
            message.member.voice.channel,
            message.channel,
            stream,
            vid
          );
        }
      }
    }
  },
};
