import sqlite3 from "better-sqlite3";
const debug = process.env.DEBUG;
const tags = new sqlite3("./data/tags.db");
import Discord, { ButtonStyle } from "discord.js";

export default {
  name: "tagcreate",
  async execute(interaction) {
    let id = interaction.guild.id;
    let keyword = interaction.fields.getTextInputValue("keywordInput");
    let response = interaction.fields.getTextInputValue("responseInput");
    let tag = tags
      .prepare(`SELECT * FROM guild_${id} WHERE tag = ?`)
      .get(keyword);
    if (tag !== undefined) {
      if (debug === "true")
        console.log("[DEBUG] Tag already exists, aborting...");
      return interaction.update({
        content: "A tag with that key word already exists!",
        ephemeral: true,
      });
    }
    tags
      .prepare(`INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`)
      .run(keyword, response);
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
      content: "Tag added successfully!",
      embeds: [tagsembed],
      components: [row],
    });
  },
};
