import sqlite3 from "better-sqlite3";
const settings = new sqlite3("./data/settings.db");
const debug = process.env.DEBUG;

export default {
  name: "sethealth",
  async execute(interaction) {
    const id = interaction.guild.id;
    let health = parseFloat(
      interaction.fields.getTextInputValue("healthInput"),
    );
    if (health < 0 || health > 100) {
      if (debug === "true") console.log("[DEBUG] Invalid input, aborting...");
      return interaction.editReply(
        "Please provide a valid number from 0 to 100!",
      );
    }
    if (debug === "true")
      console.log(`[DEBUG] New instance health for ${id}: ${health}...`);
    settings
      .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
      .run(health, "min_health");
    return interaction.editReply(
      `You will be warned if the instance health is below ${health}!`,
    );
  },
};
