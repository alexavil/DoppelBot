import sqlite3 from "better-sqlite3";
import Discord, { ButtonStyle } from "discord.js";
import { generateTagsEmbed } from "../../../utils/TagsEmbedGenerator.js";
const { default: service } = await import("../../../utils/ServiceVariables.js");
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
    if (responses.length === 0) {
      if (debug === "true") console.log("[DEBUG] No tags found...");
      let tagsembed = new Discord.EmbedBuilder().setTitle(
        `Tags for ${interaction.guild.name}`,
      );
      tagsembed.setDescription("This server has no active tags yet!");
      const addtag = new Discord.ButtonBuilder()
        .setCustomId(`tagcreate`)
        .setLabel(`Create a tag`)
        .setStyle(ButtonStyle.Primary);
      let row = new Discord.ActionRowBuilder().addComponents(addtag);
    } else {
      let reply = generateTagsEmbed(responses, 1, interaction);
      service.tags_pages.set(id, 1);
      return interaction.editReply(reply);
    }
  },
};
