const sqlite3 = require("better-sqlite3");
const debug = require("../index");
const Discord = require("discord.js");
const InvidJS = require("@invidjs/invid-js");

const settings = new sqlite3("./data/settings.db");
const tags = new sqlite3("./data/tags.db");

module.exports = {
  name: "defaults",
  description: "Resets your server settings to defaults",
  userpermissions: Discord.PermissionsBitField.Flags.Administrator,
  async execute(message) {
    const id = message.guild.id;
    if (debug.debug === true)
      console.log(`[DEBUG] Preparing to reset settings for ${id}...`);
    settings
      .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
      .run("wizard", "state");
    const filter = (m) => m.author.id == message.author.id;
    message.channel.send(
      "**ALERT:** This action will wipe your server settings and tags - use at your own risk!\nPlease type `confirm` to proceed or `cancel` to cancel.",
    );
    if (debug.debug === true)
      console.log("[DEBUG] Confirmation required - awaiting user input...");
    let confirm_collector = message.channel.createMessageCollector({
      filter,
      max: 1,
    });
    confirm_collector.on("collect", (m) => {
      switch (m.content) {
        case "cancel": {
          if (debug.debug === true)
            console.log("[DEBUG] User cancelled, aborting...");
          settings
            .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
            .run("commands", "state");
          return message.channel.send("Cancelled!");
        }
        case "confirm": {
          if (debug.debug === true)
            console.log("[DEBUG] User confirmed, proceeding...");
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
            statement.run("prefix", "d!");
            statement.run("notifications", "false");
            statement.run("disconnect_timeout", "30");
            statement.run("default_instance", "");
            statement.run("min_health", "75");
            statement.run("state", "commands");
          });
          transaction();
          InvidJS.fetchInstances({
            health: 99,
            api_allowed: true,
            limit: 1,
          }).then((result) => {
            settings
              .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
              .run(result[0].url, "default_instance");
          });
          tags
            .prepare(
              `CREATE TABLE IF NOT EXISTS guild_${id} (tag TEXT, response TEXT)`,
            )
            .run();
          if (debug.debug === true)
            console.log(`[DEBUG] Reset finished for ${id}!`);
          return message.channel.send(
            "Your settings have been reset successfully!",
          );
        }
        default: {
          if (debug.debug === true)
            console.log("[DEBUG] Invalid input, aborting...");
          settings
            .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
            .run("commands", "state");
          return message.channel.send("Invalid input - cancelled!");
        }
      }
    });
  },
};
