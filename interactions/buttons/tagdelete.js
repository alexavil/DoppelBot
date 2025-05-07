import sqlite3 from "better-sqlite3";
import Discord, { ButtonStyle } from "discord.js";
import { generateTagsMenu } from "../../utils/TagsMenuGenerator.js";
const tags = new sqlite3("./data/tags.db");
const { default: service } = await import("../../utils/Engine.js");

export default {
  name: "tagdelete",
  async execute(interaction) {
    let id = interaction.guild.id;
    let options = tags.prepare(`SELECT * FROM guild_${id}`).all();
    let reply = generateTagsMenu(options, 1);
    service.tagmenu_pages.set(id, 1);
    return interaction.update(reply);
  },
};
