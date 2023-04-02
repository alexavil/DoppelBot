const Discord = require("discord.js");
const sqlite3 = require("better-sqlite3");
const settings = new sqlite3("./data/settings.db");
module.exports = {
  name: "settings",
  description: "Show server settings",
  userpermissions: "BAN_MEMBERS",
  execute(message) {
    const id = message.guild.id;
    const settingsembed = new Discord.EmbedBuilder()
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
          name: "**Guild Prefix**",
          value: settings
            .prepare(`SELECT * FROM guild_${id} WHERE option = 'prefix'`)
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
        },
        {
          name: "**Default Invidious Instance**",
          value: settings
            .prepare(
              `SELECT * FROM guild_${id} WHERE option = 'default_instance'`
            )
            .get().value,
        },
        {
          name: "**Instance Health Threshold**",
          value: settings
            .prepare(
              `SELECT * FROM guild_${id} WHERE option = 'instance_health_threshold'`
            )
            .get().value,
        }
      );
    message.channel.send({ embeds: [settingsembed] });
  },
};
