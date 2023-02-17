const sqlite3 = require("better-sqlite3");
module.exports = {
  name: "setprefix",
  aliases: ["prefix"],
  description: "Set guild prefix",
  userpermissions: "BAN_MEMBERS",
  execute(message, args) {
    let id = message.guild.id;
    let settings = new sqlite3("./data/settings.db");
    if (!args.length) {
      let prefix = settings
        .prepare(`SELECT * FROM guild_${id} WHERE option = 'prefix'`)
        .get().value;
      return message.reply(
        "Current prefix: `" + prefix + "`.\nYou can mention the bot as well!"
      );
    }
    if (args[0].startsWith("<@") && args[0].endsWith(">"))
      return message.reply("Invalid prefix!");
    settings
      .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
      .run(args[0], "prefix");
    return message.reply("New prefix set to `" + args[0] + "`.");
  },
};
