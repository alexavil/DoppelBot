import sqlite3 from "better-sqlite3";
const debug = process.env.DEBUG;
import Discord from "discord.js";
export default {
  name: "settimeout",
  aliases: ["timeout"],
  description: "Set disconnect timeout",
  userpermissions: Discord.PermissionsBitField.Flags.BanMembers,
  execute(message, args) {
    let id = message.guild.id;
    let settings = new sqlite3("./data/settings.db");
    if (!args.length || !Number.isInteger(parseInt(args[0]))) {
      if (debug === "true") console.log("[DEBUG] Invalid input, aborting...");
      return message.reply("Invalid value! Please type the time in seconds.");
    }
    if (debug === "true")
      console.log(`[DEBUG] New disconnect timeout for ${id}: ${args[0]}...`);
    settings
      .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
      .run(args[0], "disconnect_timeout");
    return message.reply(
      `The bot will disconnect after ${args[0]} seconds if there's no activity in VC.`,
    );
  },
};
