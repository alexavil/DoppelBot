const sqlite3 = require("better-sqlite3");
const fs = require("fs-extra");

const settings = new sqlite3("./data/settings.db");
const tags = new sqlite3("./data/tags.db");

module.exports = {
  name: "defaults",
  description: "Resets your server settings to defaults",
  userpermissions: "ADMINISTRATOR",
  async execute(message, args) {
    const id = message.guild.id;
    settings
      .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
      .run("wizard", "state");
    const filter = (m) => m.author.id == message.author.id;
    message.channel.send(
      "**ALERT:** This action will wipe your server settings and tags - use at your own risk!\nPlease type `confirm` to proceed or `cancel` to cancel."
    );
    let confirm_collector = message.channel.createMessageCollector({
      filter,
      max: 1,
    });
    confirm_collector.on("collect", (m) => {
      switch (m.content) {
        case "cancel": {
          settings
            .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
            .run("commands", "state");
          return message.channel.send("Cancelled!");
        }
        case "confirm": {
          settings.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
          tags.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
          settings
            .prepare(
              `CREATE TABLE IF NOT EXISTS guild_${id} (option TEXT UNIQUE, value TEXT)`
            )
            .run();
          settings
            .prepare(`INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`)
            .run("prefix", "d!");
          settings
            .prepare(`INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`)
            .run("notifications", "false");
          settings
            .prepare(`INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`)
            .run("disconnect_timeout", "30");
          settings
            .prepare(`INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`)
            .run("default_instance", "https://invidious.snopyta.org");
          settings
            .prepare(`INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`)
            .run("state", "commands");
          tags
            .prepare(
              `CREATE TABLE IF NOT EXISTS guild_${id} (tag TEXT, response TEXT)`
            )
            .run();
          return message.channel.send(
            "Your settings have been reset successfully!"
          );
        }
        default: {
          settings
            .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
            .run("commands", "state");
          return message.channel.send("Invalid input - cancelled!");
        }
      }
    });
  },
};
