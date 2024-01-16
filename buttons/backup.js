import sqlite3 from "better-sqlite3";
import fs from "fs-extra";
const debug = process.env.DEBUG;

const settings = new sqlite3("./data/settings.db");
const tags = new sqlite3("./data/tags.db");

export default {
  name: "backup",
  async execute(interaction) {
    const id = interaction.guild.id;
    if (debug === "true") console.log(`[DEBUG] Preparing backup for ${id}...`);
    let backup = settings
      .prepare(`SELECT * FROM guild_${id} WHERE option != 'state'`)
      .all();
    let tags_backup = tags.prepare(`SELECT * FROM guild_${id}`).all();
    let json = JSON.stringify(backup);
    let tags_json = JSON.stringify(tags_backup);
    if (debug === "true") {
      console.log("[DEBUG] Settings JSON: " + json);
      console.log("[DEBUG] Tags JSON: " + tags_json);
    }
    await fs.writeJSON(`${id}.json`, json + "\n" + tags_json);
    await interaction.editReply({
      content: "Your backup is ready! Copy it to a safe place.",
      files: [`${id}.json`],
      ephemeral: true,
    });
    fs.unlink(`${id}.json`);
  },
};
