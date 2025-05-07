import engine from "../../utils/Engine.js";
import sqlite3 from "better-sqlite3";
import Discord, { ButtonStyle } from "discord.js";
const tags = new sqlite3("./data/tags.db");

import { generateTagsEmbed } from "../../utils/TagsEmbedGenerator.js";
const { default: service } = await import("../../utils/Engine.js");

export default {
  name: "tagdelete",
  async execute(interaction) {
    let id = interaction.guild.id;

    engine.debugLog(`Starting tag deletion for ${id}...`);
    const keywords = interaction.values;
    for (const keyword of keywords) {
      tags.prepare(`DELETE FROM guild_${id} WHERE tag = '${keyword}'`).run();
    }
    engine.debugLog(`Fetching tag list for ${id}...`);
    let responses = tags.prepare(`SELECT * FROM guild_${id}`).all();
    if (responses.length === 0) {
      engine.debugLog("No tags found...");
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
      return interaction.update(reply);
    }
  },
};
