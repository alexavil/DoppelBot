import sqlite3 from "better-sqlite3";
import Discord, { ButtonStyle } from "discord.js";
const debug = process.env.DEBUG;

const tags = new sqlite3("./data/tags.db");

export default {
  data: new Discord.SlashCommandBuilder()
    .setName("tags")
    .setDescription("List tags"),
  async execute(interaction) {
    let id = interaction.guild.id;
    if (debug === "true") console.log(`[DEBUG] Fetching tag list for ${id}...`);
    let responses = tags.prepare(`SELECT * FROM guild_${id}`).all();
    let tagsembed = new Discord.EmbedBuilder().setTitle(
      `Tags for ${interaction.guild.name}`,
    );
    let row = undefined;
    const addtag = new Discord.ButtonBuilder()
      .setCustomId(`tagcreate`)
      .setLabel(`Create a tag`)
      .setStyle(ButtonStyle.Primary);
    if (responses.length === 0) {
      if (debug === "true") console.log("[DEBUG] No tags found...");
      tagsembed.setDescription("This server has no active tags yet!");
      row = new Discord.ActionRowBuilder().addComponents(addtag);
    } else {
      responses.forEach((response) => {
        tagsembed.addFields({
          name: `Key Phrase: ${response.tag}`,
          value: `Response: ${response.response}`,
        });
      });
      const deltag = new Discord.ButtonBuilder()
        .setCustomId(`tagdelete`)
        .setLabel(`Delete tags`)
        .setStyle(ButtonStyle.Danger);
      const deftag = new Discord.ButtonBuilder()
        .setCustomId(`tagdefaults`)
        .setLabel(`Clear all tags`)
        .setStyle(ButtonStyle.Danger);
      row = new Discord.ActionRowBuilder().addComponents(
        addtag,
        deltag,
        deftag,
      );
    }
    switch (
      interaction.member.permissions.has(Discord.PermissionFlagsBits.BanMembers)
    ) {
      case true:
        return interaction.editReply({
          embeds: [tagsembed],
          components: [row],
        });
      case false:
        return interaction.editReply({ embeds: [tagsembed] });
    }
  },
};
