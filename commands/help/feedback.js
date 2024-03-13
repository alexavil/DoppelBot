import Discord from "discord.js";
const telemetry = process.env.TELEMETRY;
export default {
  data: new Discord.SlashCommandBuilder()
    .setName("feedback")
    .setDescription("Leave feedback for the developers"),
    shouldWait: false,
    async execute(interaction) {
        if (telemetry === "none") return interaction.reply({ content: "Sorry, this command is disabled due to the restrictions for this bot." })
        const modal = new Discord.ModalBuilder()
          .setCustomId(`feedbackmodal`)
          .setTitle("Leave feedback");
        const titleInput = new Discord.TextInputBuilder()
          .setCustomId("titleInput")
          .setLabel("Title")
          .setStyle(Discord.TextInputStyle.Short)
          .setRequired(true);
        const responseInput = new Discord.TextInputBuilder()
          .setCustomId("responseInput")
          .setLabel("Feedback Message")
          .setStyle(Discord.TextInputStyle.Paragraph)
          .setRequired(true);
        const firstActionRow = new Discord.ActionRowBuilder().addComponents(
          titleInput,
        );
        const secondActionRow = new Discord.ActionRowBuilder().addComponents(
          responseInput,
        );
        modal.addComponents(firstActionRow, secondActionRow);
        await interaction.showModal(modal);
      },
};
