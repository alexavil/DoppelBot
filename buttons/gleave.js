const debug = process.env.DEBUG;
import Discord from "discord.js";
export default {
  name: "gleave",
  async execute(interaction) {
    let values = [];
    let options = interaction.client.guilds.cache;
    options.forEach((option => {
        let menuOption = new Discord.StringSelectMenuOptionBuilder()
            .setLabel(option.name)
            .setValue(option.id);
        values.push(menuOption);
    }))
    const menu = new Discord.StringSelectMenuBuilder()
      .setCustomId(`gleave`)
      .setOptions(values)
      .setMinValues(1)
      .setMaxValues(values.length);
    const row = new Discord.ActionRowBuilder().addComponents(
        menu
    );
    await interaction.editReply({content: `Select guild(s) to leave.`, components: [row], ephemeral: true});
  },
};
