import Discord from "discord.js";
import * as InvidJS from "@invidjs/invid-js";
const debug = process.env.DEBUG;
export default {
  data: new Discord.SlashCommandBuilder()
    .setName("suggest")
    .setDescription("Suggest search results")
    .addStringOption((option) =>
      option.setName("query").setDescription("Search query").setRequired(true),
    ),
  async execute(interaction) {
    let query = interaction.options.getString("query");
    if (debug === "true") {
      console.log(`[DEBUG] User query: ${query}...`);
      console.log("[DEBUG] Fetching suggestions...");
    }
    let instances = await InvidJS.fetchInstances({ api_allowed: true });
    let results = await InvidJS.fetchSearchSuggestions(
      instances[Math.floor(Math.random() * instances.length)],
      query,
    );
    if (!results.length) {
      if (debug === "true") console.log("[DEBUG] No content was found...");
      return interaction.editReply(
        "No suggestions were found based on your search query!",
      );
    }
    let title = "Suggestions for `" + query + "`:";
    let result = "";
    results.forEach((suggestion) => {
      result += "\n`" + suggestion + "`";
    });
    let embed = new Discord.EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(title)
      .setDescription(result)
      .setFooter({ text: "Powered by InvidJS - https://invidjs.js.org/" });
    return interaction.editReply({ embeds: [embed] });
  },
};
