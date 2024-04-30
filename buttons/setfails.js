import Discord, { ButtonStyle } from "discord.js";
export default {
  name: "setfails",
  async execute(interaction) {
    const modal = new Discord.ModalBuilder()
      .setCustomId(`setfails`)
      .setTitle("Invidious: Set Error Threshold");
    const errorInput = new Discord.TextInputBuilder()
      .setCustomId("errorInput")
      .setLabel("Error Threshold")
      .setStyle(Discord.TextInputStyle.Short)
      .setRequired(true);
    const firstActionRow = new Discord.ActionRowBuilder().addComponents(
      errorInput,
    );
    modal.addComponents(firstActionRow);
    await interaction.showModal(modal);
  },
};
