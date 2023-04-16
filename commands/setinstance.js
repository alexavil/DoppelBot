const sqlite3 = require("better-sqlite3");
const InvidJS = require("@invidjs/invid-js");
const Discord = require("discord.js");
const debug = require("../index");

const settings = new sqlite3("./data/settings.db");
module.exports = {
  name: "setinstance",
  aliases: ["instance"],
  description: "Set default Invidious Instance",
  userpermissions: Discord.PermissionsBitField.Flags.BanMembers,
  async execute(message, args) {
    const id = message.guild.id;
    let min_health = settings
      .prepare(`SELECT * FROM guild_${id} WHERE option = 'min_health'`)
      .get().value;
    if (!args.length || args.length > 1) {
      if (debug.debug === true)
        console.log("[DEBUG] Invalid input, aborting...");
      return message.reply("Please provide a valid Invidious instance URL!");
    }
    let url = args[0];
    if (url === "best") {
      let result = await InvidJS.fetchInstances({
        health: 99,
        api_allowed: true,
        limit: 1,
      });
      if (debug.debug === true)
        console.log(
          "[DEBUG] New instance for " + id + ": " + result[0].url + "..."
        );
      settings
        .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
        .run(result[0].url, "default_instance");
      return message.reply(
        "`" + result[0].url + "` is now the default instance!"
      );
    }
    if (url[url.length - 1] === "/") {
      url.slice(0, -1);
    }
    let result = await InvidJS.fetchInstances({ url: url });
    if (!result.length) {
      if (debug.debug === true)
        console.log("[DEBUG] No instances were found, aborting...");
      return message.reply("Please provide a valid Invidious instance URL!");
    }
    if (result[0].api_allowed === false) {
      if (debug.debug === true)
        console.log(
          "[DEBUG] Provided instance does not allow API access, aborting..."
        );
      return message.reply("This instance does not allow API calls!");
    }
    if (result[0].health < min_health) {
      if (debug.debug === true)
        console.log("[DEBUG] Instance too unhealthy, aborting...");
      return message.reply(
        "ALERT: Instance health too low. The default instance will not be changed."
      );
    }
    if (debug.debug === true)
      console.log("[DEBUG] New instance for " + id + ": " + url + "...");
    settings
      .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
      .run(url, "default_instance");
    return message.reply("`" + url + "` is now the default instance!");
  },
};
