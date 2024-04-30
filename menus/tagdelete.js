import sqlite3 from "better-sqlite3";
const tags = new sqlite3("./data/tags.db");
const debug = process.env.DEBUG;
import Discord, { ButtonStyle } from "discord.js";

export default {
  name: "tagdelete",
  async execute(interaction) {
    let id = interaction.guild.id;
    if (debug === "true")
      console.log(`[DEBUG] Starting tag deletion for ${id}...`);
    const keywords = interaction.values;
    for (const keyword of keywords) {
      tags.prepare(`DELETE FROM guild_${id} WHERE tag = '${keyword}'`).run();
    }
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
        .setLabel(`Delete a tag`)
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
    return interaction.update({
      content: "Tags deleted successfully!",
      embeds: [tagsembed],
      components: [row],
    });
  },
};
