import sqlite3 from "better-sqlite3";
const debug = process.env.DEBUG;
const tags = new sqlite3("./data/tags.db");

export default {
  name: "createtag",
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
      return interaction.reply({
        content: "A tag with that key word already exists!",
        ephemeral: true,
      });
    }
    tags
      .prepare(`INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`)
      .run(keyword, response);
    return interaction.reply({
      content: "Tag added successfully!",
      ephemeral: true,
    });
  },
};
