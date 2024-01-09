import Discord from "discord.js";

export default {
  name: "say",
  async execute(interaction) {
    const modal = new Discord.ModalBuilder()
      .setCustomId(`say`)
      .setTitle("Send a message");
    const channelInput = new Discord.TextInputBuilder()
      .setCustomId("channelInput")
      .setLabel("Channel ID")
      .setPlaceholder(`Leave blank for current channel.`)
      .setRequired(false)
      .setStyle(Discord.TextInputStyle.Short);
    const responseInput = new Discord.TextInputBuilder()
      .setCustomId("responseInput")
      .setLabel("Response")
      .setPlaceholder(`Message`)
      .setMaxLength(2000)
      .setStyle(Discord.TextInputStyle.Paragraph)
      .setRequired(true);
    const firstActionRow = new Discord.ActionRowBuilder().addComponents(
      channelInput
    );
    const secondActionRow = new Discord.ActionRowBuilder().addComponents(responseInput);
    modal.addComponents(firstActionRow, secondActionRow);
    await interaction.showModal(modal);
  },
};
