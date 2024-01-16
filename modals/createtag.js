import sqlite3 from "better-sqlite3";

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
          settings
            .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
            .run("commands", "state");
          return interaction.editReply("A tag with that key word already exists!");
        }
        tags
          .prepare(`INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`)
          .run(keyword, response);
        return interaction.editReply({ content: "Tag added successfully!" });
	},
};