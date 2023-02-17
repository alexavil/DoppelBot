const Discord = require("discord.js");
const sqlite3 = require("better-sqlite3");
const settings = new sqlite3("./settings.db");
module.exports = {
  name: "settings",
  description: "Show server settings",
  userpermissions: "BAN_MEMBERS",
  execute(message) {
    const id = message.guild.id;
    const settingsembed = new Discord.MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Server Settings for " + message.guild.name)
      .addFields(
        {
          name: "**Service Notifications**",
          value: settings
            .prepare(`SELECT * FROM guild_${id} WHERE option = 'notifications'`)
            .get().value,
        },
        {
          name: "**Disconnect Timeout**",
          value:
            parseInt(
              settings
                .prepare(
                  `SELECT * FROM guild_${id} WHERE option = 'disconnect_timeout'`
                )
                .get().value
            ) + " seconds",
        }
      );
    message.channel.send({ embeds: [settingsembed] });
  },
};
