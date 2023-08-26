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
    if (settings.prepare(`SELECT * FROM guild_${id} WHERE option = ?`).get("music_mode").value === "radio")
      return message.reply("You can't use this command while tuned to 85.2 FM!");
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
          "Due to migration to InvidJS, the content will be played using the default Invidious instance for this server.",
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
        "Your track will be played using the default Invidious instance for this server.",
      );
      url = default_url + "/watch?v=" + url;
    }
    common.endTimeout(id);
    if (debug.debug === true) console.log(`[DEBUG] Validating ${url}...`);
    if (url.includes("/watch?v=")) {
      await common.getVideo(url, message, false);
    }
    if (url.includes("/playlist?list=")) {
      await common.getPlaylist(url, message);
    }
  },
};
