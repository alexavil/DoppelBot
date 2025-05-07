import engine from "../../utils/Engine.js";
import sqlite3 from "better-sqlite3";
import { generateTagsMenu } from "../../utils/TagsMenuGenerator.js";
const { default: service } = await import("../../utils/Engine.js");
const tags = new sqlite3("./data/tags.db");

export default {
  name: "tagmenu_next",
  async execute(interaction) {
    try {
      let id = interaction.guild.id;
      let responses = tags.prepare(`SELECT * FROM guild_${id}`).all();
      let page = service.tagmenu_pages.get(id) || 1;
      let new_page = page + 1;

      service.tagmenu_pages.set(id, new_page);
      let reply = generateTagsMenu(responses, new_page);

      return interaction.update(reply);
    } catch (error) {
      engine.debugLog(error);
      return interaction.reply({
        content: "There was an error!",
        ephemeral: true,
      });
    }
  },
};
