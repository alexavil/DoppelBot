import sqlite3 from "better-sqlite3";
const tags = new sqlite3("./data/tags.db");
const debug = process.env.DEBUG;

export default {
  name: "deletetag",
  async execute(interaction) {
    let id = interaction.guild.id;
    if (debug === "true")
      console.log(`[DEBUG] Starting tag deletion for ${id}...`);
    const keywords = interaction.values;
    for (const keyword of keywords) {
      if (
        tags
          .prepare(`SELECT * FROM guild_${id} WHERE tag = '${keyword}'`)
          .get() === undefined
      ) {
        if (debug === "true") console.log("[DEBUG] Invalid input, aborting...");
        return interaction.reply("Please type a valid tag to delete!");
      }
      tags.prepare(`DELETE FROM guild_${id} WHERE tag = '${keyword}'`).run();
    }
    return interaction.reply({
      content: "Tags deleted successfully!",
      ephemeral: true,
    });
  },
};
