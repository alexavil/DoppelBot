import Discord, { ButtonStyle } from "discord.js";
export default {
  name: "settimeout",
  async execute(interaction) {
    const modal = new Discord.ModalBuilder()
      .setCustomId(`settimeout`)
      .setTitle("Set VC timeout");
    const timeoutInput = new Discord.TextInputBuilder()
      .setCustomId("timeoutInput")
      .setLabel("Timeout (in seconds)")
      .setStyle(Discord.TextInputStyle.Short)
      .setRequired(true);
    const firstActionRow = new Discord.ActionRowBuilder().addComponents(
      timeoutInput,
    );
    modal.addComponents(firstActionRow);
    await interaction.showModal(modal);
  },
};
