const sqlite3 = require("better-sqlite3");
const debug = require("../index");
const Discord = require("discord.js");
module.exports = {
  name: "setprefix",
  aliases: ["prefix"],
  description: "Set guild prefix",
  userpermissions: Discord.PermissionsBitField.Flags.BanMembers,
  execute(message, args) {
    let id = message.guild.id;
    let settings = new sqlite3("./data/settings.db");
    if (!args.length) {
      if (debug.debug === true)
        console.log("[DEBUG] Invalid input, aborting...");
      return message.reply("Invalid prefix!");
    }
    if (args[0].startsWith("<@") && args[0].endsWith(">")) {
      if (debug.debug === true)
        console.log("[DEBUG] Invalid input, aborting...");
      return message.reply("Invalid prefix!");
    }
    if (debug.debug === true)
      console.log("[DEBUG] New prefix for " + id + ": " + args[0] + "...");
    settings
      .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
      .run(args[0], "prefix");
    return message.reply("New prefix set to `" + args[0] + "`.");
  },
};
