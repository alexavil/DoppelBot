const sqlite3 = require("better-sqlite3");
const fs = require("fs-extra");
const debug = require("../index");
const Discord = require("discord.js");

const settings = new sqlite3("./data/settings.db");
const tags = new sqlite3("./data/tags.db");

module.exports = {
  name: "backup",
  description: "Backup your server settings",
  userpermissions: Discord.PermissionsBitField.Flags.Administrator,
  async execute(message) {
    const id = message.guild.id;
    if (debug.debug === true)
      console.log(`[DEBUG] Preparing backup for ${id}...`);
    let backup = settings
      .prepare(`SELECT * FROM guild_${id} WHERE option != 'state'`)
      .all();
    let tags_backup = tags.prepare(`SELECT * FROM guild_${id}`).all();
    let json = JSON.stringify(backup);
    let tags_json = JSON.stringify(tags_backup);
    if (debug.debug === true) {
      console.log("[DEBUG] Settings JSON: " + json);
      console.log("[DEBUG] Tags JSON: " + tags_json);
    }
    await fs.writeJSON(`${id}.json`, json + "\n" + tags_json);
    await message.channel.send({
      content: "Your backup is ready!",
      files: [`${id}.json`],
    });
    fs.unlink(`${id}.json`);
  },
};
