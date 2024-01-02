import Discord from "discord.js";
import sqlite3 from "better-sqlite3";
const debug = process.env.DEBUG;

const tags = new sqlite3("./data/tags.db");

export default {
  name: "listtags",
  aliases: ["tagl"],
  description: "List tags",
  execute(message) {
    let id = message.guild.id;
    if (debug === "true") console.log(`[DEBUG] Fetching tag list for ${id}...`);
    let responses = tags.prepare(`SELECT * FROM guild_${id}`).all();
    let tagsembed = new Discord.EmbedBuilder().setTitle(
      `Tags for ${message.guild.name}`,
    );
    if (responses.length === 0) {
      if (debug === "true") console.log("[DEBUG] No tags found...");
      tagsembed.setDescription("This server has no active tags yet!");
      return message.channel.send({ embeds: [tagsembed] });
    }
    responses.forEach((response) => {
      tagsembed.addFields({
        name: `Key Phrase: ${response.tag}`,
        value: `Response: ${response.response}`,
      });
    });
    return message.channel.send({ embeds: [tagsembed] });
  },
};
