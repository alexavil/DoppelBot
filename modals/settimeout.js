import sqlite3 from "better-sqlite3";
const settings = new sqlite3("./data/settings.db");
const debug = process.env.DEBUG;

export default {
  name: "settimeout",
  async execute(interaction) {
    const id = interaction.guild.id;
    let timeout = parseInt(
      interaction.fields.getTextInputValue("timeoutInput"),
    );
    if (timeout < 0 || !Number.isInteger(timeout)) {
      if (debug === "true") console.log("[DEBUG] Invalid input, aborting...");
      return interaction.editReply("Please provide a valid number in seconds!");
    }
    if (debug === "true")
      console.log(`[DEBUG] New disconnect timeout for ${id}: ${timeout}...`);
    settings
      .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
      .run(timeout, "disconnect_timeout");
    return interaction.editReply(
      `The bot will disconnect after ${timeout} seconds if there's no activity in VC.`,
    );
  },
};
