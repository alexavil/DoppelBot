const Discord = require("discord.js");
const debug = require("../index");
const { getVoiceConnection } = require("@discordjs/voice");
const sqlite3 = require("better-sqlite3");
const common = require("../music");

const masterqueue = new sqlite3("./data/queue.db");
module.exports = {
  name: "stop",
  description: "Stop the music",
  async execute(message) {
    const id = message.guild.id;
    const channel = message.member.voice.channel;
    if (
      !message.channel
        .permissionsFor(message.author)
        .has(Discord.PermissionsBitField.Flags.BanMembers) &&
      channel.members.size !== 2
    ) {
      if (debug.debug === true)
        console.log("[DEBUG] User is not admin or alone, stop not allowed...");
      return message.reply("You are not allowed to stop!");
    }
    const connection = getVoiceConnection(id);
    if (!connection) return message.channel.send("The bot is already stopped!");
    else {
      common.stopCounter(id);
      if (debug.debug === true)
        console.log("[DEBUG] Stopping the connection...");
      connection.destroy();
      common.removePlayer(id);
      masterqueue.prepare(`DELETE FROM guild_${id}`).run();
      return message.reply("Stopped!");
    }
  },
};
