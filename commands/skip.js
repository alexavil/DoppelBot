const Discord = require("discord.js");
const debug = require("../index");
const { getVoiceConnection } = require("@discordjs/voice");
const sqlite3 = require("better-sqlite3");
const common = require("../music");

const masterqueue = new sqlite3("./data/queue.db");
const settings = new sqlite3("./data/settings.db");
module.exports = {
  name: "skip",
  description: "Skip the music",
  aliases: ["s"],
  async execute(message) {
    const id = message.guild.id;
    if (settings.prepare(`SELECT * FROM guild_${id} WHERE option = ?`).get("music_mode").value === "radio")
      return message.reply("You can't use this command while tuned to 85.2 FM!");
    const connection = getVoiceConnection(id);
    const channel = message.member.voice.channel;
    if (!connection) return message.reply("Nothing to skip!");
    if (
      !message.channel
        .permissionsFor(message.author)
        .has(Discord.PermissionsBitField.Flags.BanMembers) &&
      channel.members.size !== 2
    ) {
      if (debug.debug === true)
        console.log("[DEBUG] User is not admin or alone, skip not allowed...");
      return message.reply("You are not allowed to skip!");
    }
    if (
      masterqueue
        .prepare(`SELECT * FROM guild_${id} ORDER BY ROWID LIMIT 1`)
        .get().isLooped === "true"
    ) {
      if (debug.debug === true)
        console.log("[DEBUG] The current track is looped, unlooping...");
      masterqueue
        .prepare(`UPDATE guild_${id} SET isLooped = 'false' LIMIT 1`)
        .run();
    }
    if (debug.debug === true)
      console.log("[DEBUG] Skipping the current track...");
    let player = common.getPlayer(id);
    player.player.stop();
    message.reply("Skipped!");
  },
};
