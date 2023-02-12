const sqlite3 = require("better-sqlite3");
module.exports = {
  name: "settimeout",
  aliases: ["timeout"],
  description: "Set disconnect timeout",
  userpermissions: "BAN_MEMBERS",
  execute(message, args) {
    let id = message.guild.id;
    let settings = new sqlite3("./settings.db");
    if (!args.length) {
      let timer = settings
        .prepare(`SELECT * FROM guild_${id} WHERE option = 'disconnect_timeout'`)
        .get().value;
      return message.reply(
        "The bot will disconnect after " + timer + " seconds if there's no activity in VC."
      );
    }
    if (!Number.isInteger(parseInt(args[0])))
      return message.reply("Invalid value! Please type the time in seconds.");
    settings
      .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
      .run(args[0], "disconnect_timeout");
    return message.reply("The bot will disconnect after " + args[0] + " seconds if there's no activity in VC.");
  },
};
