import sqlite3 from "better-sqlite3";
import Discord, { ButtonStyle } from "discord.js";
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
      .setCustomId(`tagdelete`)
      .setOptions(values)
      .setMinValues(1)
      .setMaxValues(values.length);
    const cancel = new Discord.ButtonBuilder()
      .setCustomId(`cancel`)
      .setLabel(`Cancel`)
      .setStyle(ButtonStyle.Primary);
    const row = new Discord.ActionRowBuilder().addComponents(menu);
    const row2 = new Discord.ActionRowBuilder().addComponents(cancel);
    await interaction.update({
      content: `Select tag(s) to delete.`,
      components: [row, row2],
      flags: Discord.MessageFlags.Ephemeral,
    });
  },
};
