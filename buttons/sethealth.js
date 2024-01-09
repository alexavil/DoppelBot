import Discord from "discord.js";
export default {
  name: "sethealth",
  async execute(interaction) {
    const modal = new Discord.ModalBuilder()
      .setCustomId(`sethealth`)
      .setTitle("Invidious: Set minimum health");
    const healthInput = new Discord.TextInputBuilder()
      .setCustomId("healthInput")
      .setLabel("Health Threshold")
      .setStyle(Discord.TextInputStyle.Short)
      .setRequired(true);
    const firstActionRow = new Discord.ActionRowBuilder().addComponents(
        healthInput
    );
    modal.addComponents(firstActionRow);
    await interaction.showModal(modal);
  },
};
