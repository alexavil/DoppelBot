import debugLog from "../../utils/DebugHandler.js";
import sqlite3 from "better-sqlite3";
import { generateTagsEmbed } from "../../utils/TagsEmbedGenerator.js";
const { default: service } = await import("../../utils/ServiceVariables.js");
const tags = new sqlite3("./data/tags.db");

export default {
  name: "tags_next",
  async execute(interaction) {
    try {
      let id = interaction.guild.id;
      let responses = tags.prepare(`SELECT * FROM guild_${id}`).all();
      let page = service.tags_pages.get(id) || 1;
      let new_page = page + 1;

      service.tags_pages.set(id, new_page);
      let reply = generateTagsEmbed(responses, new_page, interaction);

      return interaction.update(reply);
    } catch (error) {
      debugLog(error);
      return interaction.reply({
        content: "There was an error!",
        ephemeral: true,
      });
    }
  },
};
