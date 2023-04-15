const sqlite3 = require("better-sqlite3");
const debug = require("../index");
const Discord = require("discord.js");
module.exports = {
  name: "sethealth",
  aliases: ["health"],
  description: "Set minimum Invidious instance health",
  userpermissions: Discord.PermissionsBitField.Flags.BanMembers,
  async execute(message, args) {
    let id = message.guild.id;
    let settings = new sqlite3("./data/settings.db");
    if (
      !args.length ||
      args.length > 1 ||
      parseFloat(args[0]) < 0 ||
      parseFloat(args[0]) > 100
    ) {
      if (debug.debug === true)
        console.log("[DEBUG] Invalid input, aborting...");
      return message.reply("Please provide a valid number from 0 to 100!");
    }
    let health = parseFloat(args[0]);
    if (debug.debug === true)
      console.log(
        "[DEBUG] New instance health for " + id + ": " + health + "..."
      );
    settings
      .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
      .run(health, "min_health");
    return message.reply(
      "You will be warned if the instance health is below `" + health + "`!"
    );
  },
};
