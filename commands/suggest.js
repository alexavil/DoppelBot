const InvidJS = require("@invidjs/invid-js");
const debug = require("../index");
const sqlite3 = require("better-sqlite3");

const settings = new sqlite3("./data/settings.db");
module.exports = {
  name: "suggest",
  description: "Suggest search results",
  async execute(message, args) {
    const id = message.guild.id;
    let default_url = settings
      .prepare(`SELECT * FROM guild_${id} WHERE option = 'default_instance'`)
      .get().value;
    if (!args[0]) {
      if (debug.debug === true)
        console.log("[DEBUG] Invalid input, aborting...");
      return message.reply("Provide a valid query!");
    }
    let query = args.slice(0).join(" ");
    if (debug.debug === true) {
      console.log("[DEBUG] User query: " + query + "...");
      console.log("[DEBUG] Fetching suggestions...");
    }
    let instance = await InvidJS.fetchInstances({ url: default_url });
    let results = await InvidJS.fetchSearchSuggestions(instance[0], query);
    if (!results.length) {
      if (debug.debug === true) console.log("[DEBUG] No content was found...");
      return message.reply(
        "No suggestions were found based on your search query!"
      );
    }
    let result = "Suggestions for `" + query + "`:";
    results.forEach((suggestion) => {
      result += "\n`" + suggestion + "`";
    });
    return message.channel.send(result);
  },
};
