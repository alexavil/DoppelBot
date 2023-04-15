const sqlite3 = require("better-sqlite3");
const debug = require("../index");
module.exports = {
  name: "notifications",
  aliases: ["notifs"],
  description: "Set notifications for your server",
  execute(message, args) {
    let id = message.guild.id;
    let settings = new sqlite3("./data/settings.db");
    if (message.author.id !== message.guild.ownerId) return false;
    if (!args.length) {
      let value = settings
        .prepare(`SELECT * FROM guild_${id} WHERE option = 'notifications'`)
        .get().value;
      switch (value) {
        case "false":
          if (debug.debug === true)
            console.log(
              "[DEBUG] Notifications are disabled for " +
                id +
                ", switching on..."
            );
          settings
            .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
            .run("true", "notifications");
          return message.channel.send(`Service notifications are now enabled!`);
        case "true":
          if (debug.debug === true)
            console.log(
              "[DEBUG] Notifications are enabled for " +
                id +
                ", switching off..."
            );
          settings
            .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
            .run("false", "notifications");
          return message.channel.send(
            `Service notifications are now disabled!`
          );
      }
    } else return false;
  },
};
