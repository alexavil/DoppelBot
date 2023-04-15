const InvidJS = require("@invidjs/invid-js");
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
    let notifications = settings
      .prepare(`SELECT * FROM guild_${id} WHERE option = 'notifications'`)
      .get().value;  
    url = args[0];
    if (common.disallowedLinks.some((link) => url.startsWith(link))) {
      if (debug.debug === true)
        console.log("[DEBUG] YouTube link detected, redirecting...");
      if (notifications === "true") message.channel.send(
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
        console.log("[DEBUG] ID detected, redirecting to default instance...");
        if (notifications === "true") message.reply(
        "Your track will be played using the default Invidious instance for this server."
      );
      url = default_url + "/watch?v=" + url;
    }
    common.endTimeout(id);
    if (debug.debug === true) console.log("[DEBUG] Validating " + url + "...");
    if (url.includes("/watch?v=")) {
      let fetched = await common.getVideo(url);
      let queuelength = masterqueue
        .prepare(`SELECT * FROM guild_${id}`)
        .all().length;
      if (fetched !== undefined) {
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
            { saveTo: InvidJS.SaveSourceTo.Memory, parts: 10 }
          );
          if (debug.debug === true) console.log("[DEBUG] Creating player...");
          message.channel.send(
            `Now playing: ${fetched.url}\nRequested by <@!${message.author.id}>`
          );
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
        if (debug.debug === true)
          console.log("[DEBUG] Adding tracks from " + url + " to the queue...");
        fetched.playlist.videos.forEach((video) => {
          masterqueue
            .prepare(`INSERT INTO guild_${id} VALUES (?, ?, ?)`)
            .run(
              fetched.instance.url + "/watch?v=" + video.id,
              message.author.id,
              "false"
            );
        });
        message.reply("Playlist added to queue!");
        if (queuelength === 0) {
          if (debug.debug === true)
            console.log("[DEBUG] Starting the first track...");
          let first = masterqueue
            .prepare(`SELECT * FROM guild_${id} ORDER BY ROWID LIMIT 1`)
            .get();
          if (debug.debug === true)
            console.log("[DEBUG] Validating " + first.track + "...");
          let vid = await common.getVideo(first.track);
          if (debug.debug === true)
            console.log("[DEBUG] Downloading stream...");
          let stream = await InvidJS.fetchSource(
            vid.instance,
            vid.video,
            vid.format,
            { saveTo: InvidJS.SaveSourceTo.Memory, parts: 10 }
          );
          if (debug.debug === true) console.log("[DEBUG] Creating player...");
          message.channel.send(
            `Now playing: ${vid.url}\nRequested by <@!${message.author.id}>`
          );
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
