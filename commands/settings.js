const Discord = require("discord.js");
const sqlite3 = require("better-sqlite3");
const settings = new sqlite3("./data/settings.db");
const debug = require("../index");
module.exports = {
  name: "settings",
  description: "Show server settings",
  userpermissions: Discord.PermissionsBitField.Flags.BanMembers,
  execute(message) {
    const id = message.guild.id;
    const settingsembed = new Discord.EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Server Settings for " + message.guild.name)
      .addFields(
        {
          name: "**Service Notifications**",
          value:
            "Should the bot send alerts and notifications?\nCurrent value: `" +
            settings
              .prepare(
                `SELECT * FROM guild_${id} WHERE option = 'notifications'`
              )
              .get().value +
            "`",
        },
        {
          name: "**Guild Prefix**",
          value:
            "A prefix for any command executed in this server.\nCurrent value: `" +
            settings
              .prepare(`SELECT * FROM guild_${id} WHERE option = 'prefix'`)
              .get().value +
            "`",
        },
        {
          name: "**Disconnect Timeout**",
          value:
            "How long will the bot idle before disconnecting from a voice channel?\nCurrent value: `" +
            parseInt(
              settings
                .prepare(
                  `SELECT * FROM guild_${id} WHERE option = 'disconnect_timeout'`
                )
                .get().value
            ) +
            " seconds`",
        },
        {
          name: "**Default Invidious Instance**",
          value:
            "Default Invidious instance for the guild. This instance is used when only the video ID is provided, for searching content, as well as a fallback.\nCurrent value: `" +
            settings
              .prepare(
                `SELECT * FROM guild_${id} WHERE option = 'default_instance'`
              )
              .get().value +
            "`",
        },
        {
          name: "**Lowest Instance Health**",
          value:
            "The bot will send a warning if trying to use an instance with health below this number.\nCurrent value: `" +
            settings
              .prepare(`SELECT * FROM guild_${id} WHERE option = 'min_health'`)
              .get().value +
            "`",
        }
      );
    message.channel.send({ embeds: [settingsembed] });
  },
};
