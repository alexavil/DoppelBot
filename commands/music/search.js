const debug = process.env.DEBUG;
import sqlite3 from "better-sqlite3";
const { default: common } = await import("../../music.js");
import Discord from "discord.js";

const instances = new sqlite3("./data/instances_cache.db");
export default {
  data: new Discord.SlashCommandBuilder()
    .setName("search")
    .setDescription("Search a track")
    .addStringOption((option) =>
      option.setName("query").setDescription("Search query").setRequired(true),
    ),
  async execute(interaction) {
    const id = interaction.guild.id;
    interaction.deferReply();
    let default_url = instances
      .prepare("SELECT * FROM instances ORDER BY RANDOM() LIMIT 1")
      .get().url;
    let query = interaction.options.getString("query");
    if (debug.debug === true) {
      console.log(`[DEBUG] User query: ${query}...`);
      console.log("[DEBUG] Searching...");
    }
    let value = await common.searchContent(default_url, query, 0);
    if (value === "timeout") {
      if (debug.debug === true)
        console.log("[DEBUG] Too many retries, aborting...");
      return interaction.editReply("Connection failed after 4 retries.");
    }
    if (!value.length) {
      if (debug.debug === true) console.log("[DEBUG] No content was found...");
      return interaction.editReply(
        "No content was found based on your search query!",
      );
    }
    let searchembed = new Discord.EmbedBuilder();
    value.forEach((track) => {
      searchembed.addFields({
        name: track.title,
        value: default_url + "/watch?v=" + track.id,
        inline: false,
      });
    });
    searchembed.setTitle("Please select a track:");
    searchembed.setColor("#0099ff");
    searchembed.setFooter({
      text: "Powered by InvidJS - https://invidjs.js.org/",
    });
    let embedmessage = await interaction.channel.send({
      embeds: [searchembed],
    });
    embedmessage.react(`1️⃣`);
    embedmessage.react(`2️⃣`);
    embedmessage.react(`3️⃣`);
    embedmessage.react(`4️⃣`);
    embedmessage.react(`5️⃣`);
    const filter = (reaction, user) =>
      reaction.emoji.name === `1️⃣` ||
      reaction.emoji.name === `2️⃣` ||
      reaction.emoji.name === `3️⃣` ||
      reaction.emoji.name === `4️⃣` ||
      (reaction.emoji.name === `5️⃣` && user.id === interaction.user.id);
    let choice = 0;
    if (debug.debug === true)
      console.log("[DEBUG] Choice required - awaiting user input...");
    embedmessage
      .awaitReactions({ filter, maxUsers: 2 })
      .then((collected) =>
        collected.forEach(async (emoji) => {
          if (emoji.count > 1) {
            common.endTimeout(id);
            if (debug.debug === true)
              console.log(`[DEBUG] User choice: ${choice}...`);
            let videoid = value[choice].id;
            let url = default_url + "/watch?v=" + videoid;
            await common.getVideo(url, interaction, false, true, 0);
          } else {
            choice++;
          }
        }),
      )
      .catch();
  },
};
