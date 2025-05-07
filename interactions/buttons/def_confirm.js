import engine from "../../utils/Engine.js";
import sqlite3 from "better-sqlite3";

import Discord from "discord.js";

const settings = new sqlite3("./data/settings.db");

export default {
  name: "def_confirm",
  async execute(interaction) {
    let id = interaction.guild.id;
    engine.debugLog("User confirmed, proceeding...");
    settings.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
    settings
      .prepare(
        `CREATE TABLE IF NOT EXISTS guild_${id} (option TEXT UNIQUE, value TEXT)`,
      )
      .run();
    let statement = settings.prepare(
      `INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`,
    );
    let transaction = settings.transaction(() => {
      statement.run("notifications", "false");
      statement.run("disconnect_timeout", "30");
      statement.run("fail_threshold", "10");
    });
    transaction();
    engine.debugLog(`Reset finished for ${id}!`);
    return interaction.update({
      content: "Your settings have been reset successfully!",
      components: [],
      flags: Discord.MessageFlags.Ephemeral,
    });
  },
};
