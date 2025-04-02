const debug = process.env.DEBUG;

import sqlite3 from "better-sqlite3";
import Discord, { ButtonStyle } from "discord.js";

const tags = new sqlite3("./data/tags.db");

export default {
  name: "tagdef_confirm",
  async execute(interaction) {
    let id = interaction.guild.id;
    if (debug === "true") console.log("[DEBUG] User confirmed, proceeding...");
    tags.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
    tags
      .prepare(
        `CREATE TABLE IF NOT EXISTS guild_${id} (tag TEXT, response TEXT)`,
      )
      .run();
    if (debug === "true") console.log(`[DEBUG] Reset finished for ${id}!`);
    return interaction.update({
      content: "Your tags have been wiped successfully!",
      components: [],
      flags: Discord.MessageFlags.Ephemeral,
    });
  },
};
