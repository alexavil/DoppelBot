import Discord, { ButtonStyle } from "discord.js";
import * as InvidJS from "@invidjs/invid-js";
const debug = process.env.DEBUG;
const { default: common } = await import("../../music.js");

export default {
  data: new Discord.SlashCommandBuilder()
    .setName("suggest")
    .setDescription("Suggest search results")
    .addStringOption((option) =>
      option.setName("query").setDescription("Search query").setRequired(true),
    ),
  async execute(interaction) {
    let default_url = instances
      .prepare(
        `SELECT * FROM instances WHERE health >= ${common.getHealth(id)} AND fails < ${common.getFails(id)} ORDER BY RANDOM() LIMIT 1`,
      )
      .get().url;
    let query = interaction.options.getString("query");
    if (debug === "true") {
      console.log(`[DEBUG] User query: ${query}...`);
      console.log("[DEBUG] Fetching suggestions...");
    }
    let instances = await InvidJS.fetchInstances({ api_allowed: true });
    let value = await common.getSuggestions(interaction, default_url, query, 0);
    if (typeof value === "string") {
      if (debug === "true")
        console.log("[DEBUG] Too many retries, aborting...");
      return interaction.editReply("Connection failed after 4 retries.");
    } else {
      if (!value.length) {
        if (debug === "true") console.log("[DEBUG] No content was found...");
        return interaction.editReply(
          "No suggestions were found based on your search query!",
        );
      }
      let title = "Suggestions for `" + query + "`:";
      let result = "";
      value.forEach((suggestion) => {
        result += "\n`" + suggestion + "`";
      });
      let embed = new Discord.EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(title)
        .setDescription(result)
        .setFooter({ text: "Powered by InvidJS - https://invidjs.js.org/" });
      return interaction.editReply({ embeds: [embed] });
    }
  },
};
