const debug = process.env.DEBUG;
import Discord, { ButtonStyle } from "discord.js";

export default {
  name: "gleave",
  async execute(interaction) {
    let values = [];
    let options = interaction.client.guilds.cache;
    options.forEach((option) => {
      let menuOption = new Discord.StringSelectMenuOptionBuilder()
        .setLabel(option.name)
        .setValue(option.id);
      values.push(menuOption);
    });
    const menu = new Discord.StringSelectMenuBuilder()
      .setCustomId(`gleave`)
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
      content: `Select guild(s) to leave.`,
      embeds: [],
      components: [row, row2],
      flags: Discord.MessageFlags.Ephemeral,
    });
  },
};
