import Discord from "discord.js";
import sqlite3 from "better-sqlite3";
const tags = new sqlite3("./data/tags.db");

export default {
  name: "tagdelete",
  async execute(interaction) {
    let id = interaction.guild.id;
    let values = [];
    let options = tags.prepare(`SELECT * FROM guild_${id}`).all();
    console.log(options);
    options.forEach((option) => {
      let menuOption = new Discord.StringSelectMenuOptionBuilder()
        .setLabel(option.tag)
        .setValue(option.tag);
      values.push(menuOption);
    });
    const menu = new Discord.StringSelectMenuBuilder()
      .setCustomId(`deletetag`)
      .setOptions(values)
      .setMinValues(1)
      .setMaxValues(values.length);
    const row = new Discord.ActionRowBuilder().addComponents(menu);
    await interaction.update({
      content: `Select tag(s) to delete.`,
      components: [row],
      ephemeral: true,
    });
  },
};
