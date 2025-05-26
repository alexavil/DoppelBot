import sqlite3 from "better-sqlite3";
import Discord, { ButtonStyle } from "discord.js";
const debug = process.env.DEBUG;
const tags = new sqlite3("./data/tags.db");
import { generateTagsEmbed } from "../../utils/TagsEmbedGenerator.js";
const { default: service } = await import("../../utils/ServiceVariables.js");

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
      if (debug === "true") console.log("Tag already exists, aborting...");
      return interaction.update({
        content: "A tag with that key word already exists!",
        flags: Discord.MessageFlags.Ephemeral,
      });
    }
    tags
      .prepare(`INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`)
      .run(keyword, response);
    if (debug === "true") console.log(`Fetching tag list for ${id}...`);
    let responses = tags.prepare(`SELECT * FROM guild_${id}`).all();
    let reply = generateTagsEmbed(
      responses,
      service.tags_pages.get(id),
      interaction,
    );
    return interaction.update(reply);
  },
};
