const sqlite3 = require("better-sqlite3");
const InvidJS = require("@invidjs/invid-js");
const Discord = require("discord.js");
const debug = require("../index");
module.exports = {
  name: "setinstance",
  aliases: ["instance"],
  description: "Set default Invidious Instance",
  userpermissions: Discord.PermissionsBitField.Flags.BanMembers,
  async execute(message, args) {
    let id = message.guild.id;
    let settings = new sqlite3("./data/settings.db");
    if (!args.length || args.length > 1) {
      if (debug.debug === true)
        console.log("[DEBUG] Invalid input, aborting...");
      return message.reply("Please provide a valid Invidious instance URL!");
    }
    let url = args[0];
    if (url[url.length - 1] === "/") {
      url.slice(0, -1);
    }
    let result = await InvidJS.fetchInstances({ url: url });
    if (!result.length) {
      if (debug.debug === true)
        console.log("[DEBUG] No instances were found...");
      return message.reply("Please provide a valid Invidious instance URL!");
    }
    if (result[0].api_allowed === false) {
      if (debug.debug === true)
        console.log("[DEBUG] Provided instance does not allow API access...");
      return message.reply("This instance does not allow API calls!");
    }
    if (debug.debug === true)
      console.log("[DEBUG] New instance for " + id + ": " + url + "...");
    settings
      .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
      .run(url, "default_instance");
    return message.reply("`" + url + "` is now the default instance!");
  },
};
