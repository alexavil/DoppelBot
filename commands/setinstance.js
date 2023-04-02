const sqlite3 = require("better-sqlite3");
const InvidJS = require("@invidjs/invid-js");
module.exports = {
  name: "setinstance",
  aliases: ["instance"],
  description: "Set default Invidious Instance",
  userpermissions: "BAN_MEMBERS",
  async execute(message, args) {
    let id = message.guild.id;
    let settings = new sqlite3("./data/settings.db");
    if (!args.length || args.length > 1) {
      return message.reply("Please provide a valid Invidious instance URL!");
    }
    let url = args[0];
    if (url[url.length - 1] === "/") {
      url.slice(0, -1);
    }
    let result = await InvidJS.fetchInstances({ url: url });
    if (!result.length) {
      return message.reply("Please provide a valid Invidious instance URL!");
    }
    if (result[0].api_allowed === false) {
      return message.reply("This instance does not allow API calls!");
    }
    settings
      .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
      .run(url, "default_instance");
    return message.reply("`" + url + "` is now the default instance!");
  },
};
