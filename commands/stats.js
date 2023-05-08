const Discord = require("discord.js");
const InvidJS = require("@invidjs/invid-js");
const sqlite3 = require("better-sqlite3");
const debug = require("../index");
const os = require("os");
module.exports = {
  name: "stats",
  description: "Show stats",
  async execute(message, args, client) {
    if (debug.debug === false || !message.channel.permissionsFor(message.author).has(Discord.PermissionFlagsBits.Administrator)) return false;
    const settings = new sqlite3("./data/settings.db");
    let id = message.guild.id;
    let default_instance = settings
      .prepare(`SELECT value FROM guild_${id} WHERE option = 'default_instance'`)
      .get().value;
    let instance = await InvidJS.fetchInstances({ url: default_instance });
    let invstats = await InvidJS.fetchStats(instance[0]);
    let version = settings
      .prepare(`SELECT value FROM global WHERE option = 'current_version'`)
      .get().value;
    const stats = new Discord.EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("DoppelBot Instance Stats")
      .addFields(
        {
          name: "System Information",
          value: `DoppelBot Build: ${version}
            InvidJS Version: ${
              require("../package-lock.json").packages[
                "node_modules/@invidjs/invid-js"
              ].version
            }
            OS: ${os.type()} ${os.release} ${os.arch}`,
        },
        {
          name: "Bot Stats",
          value: `Total servers: ${Array.from(client.guilds.cache).length}
          Total users: ${Array.from(client.users.cache).length}`,
        },
        {
            name: "Default Instance Stats",
            value: `URL: ${default_instance}
            Invidious Version: ${invstats.software.version}
            Latest reported health: ${instance[0].health}`
        }
      );
    message.channel.send({ embeds: [stats] });
  },
};
