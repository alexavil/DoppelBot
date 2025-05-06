import debugLog from "../../utils/DebugHandler.js";
import sqlite3 from "better-sqlite3";
import Discord from "discord.js";
const settings = new sqlite3("./data/settings.db");


export default {
  name: "notifications",
  async execute(interaction) {
    let id = interaction.guild.id;
    let value = settings
      .prepare(`SELECT * FROM guild_${id} WHERE option = 'notifications'`)
      .get().value;
    switch (value) {
      case "false":
        
          debugLog(
            "Notifications are disabled for " +
              id +
              ", switching on...",
          );
        settings
          .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
          .run("true", "notifications");
        break;
      case "true":
        
          debugLog(
            "Notifications are enabled for " +
              id +
              ", switching off...",
          );
        settings
          .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
          .run("false", "notifications");
        break;
    }
    const settingsembed = new Discord.EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Server Settings for " + interaction.guild.name)
      .addFields(
        {
          name: "**Service Notifications**",
          value:
            "Should the bot send alerts and notifications?\nCurrent value: `" +
            settings
              .prepare(
                `SELECT * FROM guild_${id} WHERE option = 'notifications'`,
              )
              .get().value +
            "`",
        },
        {
          name: "**Disconnect Timeout**",
          value:
            "How long will the bot idle before disconnecting from a voice channel?\nCurrent value: `" +
            parseInt(
              settings
                .prepare(
                  `SELECT * FROM guild_${id} WHERE option = 'disconnect_timeout'`,
                )
                .get().value,
              10,
            ) +
            " seconds`",
        },
        {
          name: "**Error Threshold**",
          value:
            "The bot will give up if the download failed this many times.\nCurrent value: `" +
            settings
              .prepare(
                `SELECT * FROM guild_${id} WHERE option = 'fail_threshold'`,
              )
              .get().value +
            "`",
        },
      );
    return interaction.update({
      embeds: [settingsembed],
    });
  },
};
