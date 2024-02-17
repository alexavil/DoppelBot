import sqlite3 from "better-sqlite3";
const settings = new sqlite3("./data/settings.db");
const debug = process.env.DEBUG;

export default {
  name: "notifications",
  async execute(interaction) {
    let id = interaction.guild.id;
    let value = settings
      .prepare(`SELECT * FROM guild_${id} WHERE option = 'notifications'`)
      .get().value;
    switch (value) {
      case "false":
        if (debug === "true")
          console.log(
            "[DEBUG] Notifications are disabled for " +
              id +
              ", switching on...",
          );
        settings
          .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
          .run("true", "notifications");
        return interaction.reply({
          content: `Service notifications are now enabled!`,
          ephemeral: true,
        });
      case "true":
        if (debug === "true")
          console.log(
            "[DEBUG] Notifications are enabled for " +
              id +
              ", switching off...",
          );
        settings
          .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
          .run("false", "notifications");
        return interaction.reply({
          content: `Service notifications are now disabled!`,
          ephemeral: true,
        });
    }
  },
};
