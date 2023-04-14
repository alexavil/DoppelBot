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
      return message.reply("You need to join a voice channel first!");
    }
    if (debug.debug === true)
      console.log("[DEBUG] Starting playback for " + id + "...");
    if (!args[0]) {
      return message.reply("Provide a valid link!");
    }
    let default_url = settings
      .prepare(`SELECT * FROM guild_${id} WHERE option = 'default_instance'`)
      .get().value;
    url = args[0];
    if (common.disallowedLinks.some((link) => url.startsWith(link))) {
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
      message.reply(
        "Your track will be played using the default Invidious instance for this server."
      );
      url = default_url + "/watch?v=" + url;
    }
    common.endTimeout(id);
    if (url.includes("/watch?v=")) {
      if (debug.debug === true)
        console.log("[DEBUG] Validating " + url + "...");
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
          if (debug.debug === true)
            console.log("[DEBUG] Downloading stream...");
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
          let first = masterqueue
            .prepare(`SELECT * FROM guild_${id} ORDER BY ROWID LIMIT 1`)
            .get();
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
