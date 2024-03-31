import sqlite3 from "better-sqlite3";
const settings = new sqlite3("./data/settings.db");
const debug = process.env.DEBUG;
import Discord, { ButtonStyle } from "discord.js";

export default {
  name: "sethealth",
  async execute(interaction) {
    const id = interaction.guild.id;
    let health = parseFloat(
      interaction.fields.getTextInputValue("healthInput"),
    );
    if (health < 0 || health > 100) {
      if (debug === "true") console.log("[DEBUG] Invalid input, aborting...");
      return interaction.reply({
        content: "Please provide a valid number from 0 to 100!",
        ephemeral: true,
      });
    }
    if (debug === "true")
      console.log(`[DEBUG] New instance health for ${id}: ${health}...`);
    settings
      .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
      .run(health, "min_health");
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
            "The bot will send a warning if trying to use an instance with health below this number.\nCurrent value: `" +
            settings
              .prepare(`SELECT * FROM guild_${id} WHERE option = 'min_health'`)
              .get().value +
            "`",
        },
      );
    return interaction.update({
      embeds: [settingsembed],
    });
  },
};
