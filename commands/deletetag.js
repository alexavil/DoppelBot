import Discord from "discord.js";
import sqlite3 from "better-sqlite3";
const debug = process.env.DEBUG;

const tags = new sqlite3("./data/tags.db");

export default {
  name: "deletetag",
  aliases: ["tagd"],
  description: "Delete a tag",
  execute(message) {
    let id = message.guild.id;
    if (debug === "true")
      console.log(`[DEBUG] Starting tag deletion for ${id}...`);
    if (
      !message.channel
        .permissionsFor(message.author)
        .has(Discord.PermissionsBitField.Flags.BanMembers)
    )
      return message.reply("You do not have permission to use this command!");
    if (
      !args[0] ||
      tags
        .prepare(`SELECT * FROM guild_${id} WHERE tag = '${args[0]}'`)
        .get() === undefined
    ) {
      if (debug === "true") console.log("[DEBUG] Invalid input, aborting...");
      return message.channel.send("Please type a valid tag to delete!");
    }
    tags.prepare(`DELETE FROM guild_${id} WHERE tag = '${args[0]}'`).run();
    return message.channel.send("Tag deleted successfully!");
  },
};
