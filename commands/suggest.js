const Discord = require("discord.js");
const InvidJS = require("@invidjs/invid-js");
const debug = require("../index");
const sqlite3 = require("better-sqlite3");

const instances = new sqlite3("./data/instances_cache.db");
module.exports = {
  name: "suggest",
  description: "Suggest search results",
  async execute(message, args) {
    if (!args[0]) {
      if (debug.debug === true)
        console.log("[DEBUG] Invalid input, aborting...");
      return message.reply("Provide a valid query!");
    }
    message.react(`⌛`);
    let default_url = instances.prepare('SELECT * FROM instances ORDER BY RANDOM() LIMIT 1').get().url;
    let query = args.slice(0).join(" ");
    if (debug.debug === true) {
      console.log(`[DEBUG] User query: ${query}...`);
      console.log("[DEBUG] Fetching suggestions...");
    }
    let instance = await InvidJS.fetchInstances({ url: default_url });
    let results = await InvidJS.fetchSearchSuggestions(instance[0], query);
    if (!results.length) {
      if (debug.debug === true) console.log("[DEBUG] No content was found...");
      message.reactions.removeAll();
      return message.reply(
        "No suggestions were found based on your search query!",
      );
    }
    let title = "Suggestions for `" + query + "`:";
    let result = "";
    results.forEach((suggestion) => {
      result += "\n`" + suggestion + "`";
    });
    message.reactions.removeAll();
    let embed = new Discord.EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(title)
      .setDescription(result)
      .setFooter({ text: "Powered by InvidJS" });
    return message.channel.send({ embeds: [embed] });
  },
};
