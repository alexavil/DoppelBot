import Discord from "discord.js";

export default {
  name: "tagcreate",
  async execute(interaction) {
    const modal = new Discord.ModalBuilder()
      .setCustomId(`tagcreate`)
      .setTitle("Create a tag");
    const keywordInput = new Discord.TextInputBuilder()
      .setCustomId("keywordInput")
      .setLabel("Tag Keyword")
      .setStyle(Discord.TextInputStyle.Short)
      .setMaxLength(256)
      .setRequired(true);
    const responseInput = new Discord.TextInputBuilder()
      .setCustomId("responseInput")
      .setLabel("Response")
      .setPlaceholder(
        `response1
---
response2`,
      )
      .setStyle(Discord.TextInputStyle.Paragraph)
      .setMaxLength(1024)
      .setRequired(true);
    const firstActionRow = new Discord.ActionRowBuilder().addComponents(
      keywordInput,
    );
    const secondActionRow = new Discord.ActionRowBuilder().addComponents(
      responseInput,
    );
    modal.addComponents(firstActionRow, secondActionRow);
    await interaction.showModal(modal);
  },
};
