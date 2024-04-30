import sqlite3 from "better-sqlite3";
const settings = new sqlite3("./data/settings.db");
const debug = process.env.DEBUG;
import Discord, { ButtonStyle } from "discord.js";

export default {
  name: "settimeout",
  async execute(interaction) {
    const id = interaction.guild.id;
    let timeout = parseInt(
      interaction.fields.getTextInputValue("timeoutInput"),
    );
    if (timeout < 0 || !Number.isInteger(timeout)) {
      if (debug === "true") console.log("[DEBUG] Invalid input, aborting...");
      return interaction.reply({
        content: "Please provide a valid number in seconds!",
        ephemeral: true,
      });
    }
    if (debug === "true")
      console.log(`[DEBUG] New disconnect timeout for ${id}: ${timeout}...`);
    settings
      .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
      .run(timeout, "disconnect_timeout");
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
            ) +
            " seconds`",
        },
        {
          name: "**Lowest Instance Health**",
          value:
            "The bot will look for an instance with health above this number.\nCurrent value: `" +
            settings
              .prepare(`SELECT * FROM guild_${id} WHERE option = 'min_health'`)
              .get().value +
            "`",
        },
        {
          name: "**Error Threshold**",
          value:
            "The bot will avoid instances that failed this many times during the day.\nCurrent value: `" +
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
