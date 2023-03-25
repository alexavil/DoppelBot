const sqlite3 = require("better-sqlite3");
const fs = require("fs-extra");

const settings = new sqlite3("./data/settings.db");
const tags = new sqlite3("./data/tags.db");

module.exports = {
  name: "backup",
  description: "Backup your server settings",
  userpermissions: "ADMINISTRATOR",
  async execute(message, args) {
    const id = message.guild.id;
    let backup = settings.prepare(`SELECT * FROM guild_${id} WHERE option != 'state'`).all();
    let tags_backup = tags.prepare(`SELECT * FROM guild_${id}`).all();
    let json = JSON.stringify(backup);
    let tags_json = JSON.stringify(tags_backup);
    await fs.writeJSON(`${id}.json`, json + "\n" + tags_json);
    await message.channel.send({ content: "Your backup is ready!", files: [`${id}.json`] });
    fs.unlink(`${id}.json`);
  },
};
