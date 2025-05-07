import { generateMusicMenu } from "../../utils/CacheMenuGenerator.js";
const { default: service } = await import("../../utils/Engine.js");

import sqlite3 from "better-sqlite3";
const cache = new sqlite3("./data/cache.db");

export default {
  name: "music_next",
  async execute(interaction) {
    try {
      let id = interaction.guild.id;
      let options = cache.prepare("SELECT * FROM files_directory").all();
      let page = service.music_pages.get(id) || 1;
      let new_page = page + 1;

      service.music_pages.set(id, new_page);
      let reply = generateMusicMenu(options, new_page);

      return interaction.update(reply);
    } catch (error) {
      return interaction.reply({
        content: "There was an error!",
        ephemeral: true,
      });
    }
  },
};
