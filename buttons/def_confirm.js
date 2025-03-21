import sqlite3 from "better-sqlite3";
const debug = process.env.DEBUG;

const settings = new sqlite3("./data/settings.db");
const tags = new sqlite3("./data/tags.db");

export default {
  name: "def_confirm",
  async execute(interaction) {
    let id = interaction.guild.id;
    if (debug === "true") console.log("[DEBUG] User confirmed, proceeding...");
    settings.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
    tags.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
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
    if (debug === "true") console.log(`[DEBUG] Reset finished for ${id}!`);
    return interaction.update({
      content: "Your settings have been reset successfully!",
      components: [],
      ephemeral: true,
    });
  },
};
