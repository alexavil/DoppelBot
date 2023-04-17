const Discord = require("discord.js");
const sqlite3 = require("better-sqlite3");
const debug = require("../index");
const os = require("os");
module.exports = {
  name: "adminhelp",
  aliases: ["ahelp"],
  description: "About the bot",
  userpermissions: Discord.PermissionsBitField.Flags.BanMembers,
  execute(message) {
    const settings = new sqlite3("./data/settings.db");
    let id = message.guild.id;
    let prefix = settings
      .prepare(`SELECT value FROM guild_${id} WHERE option = 'prefix'`)
      .get().value;
    let version = settings
      .prepare(`SELECT value FROM global WHERE option = 'current_version'`)
      .get().value;
    const help = new Discord.EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Hi, I'm DoppelBot! :heart:")
      .addFields(
        {
          name: "Service commands",
          value:
            "`" +
            prefix +
            "settings` - bring up the settings panel\n" +
            "`" +
            prefix +
            "notifications` - toggle service notifications\n" +
            "`" +
            prefix +
            "setprefix` - change the guild prefix\n" +
            "`" +
            prefix +
            "settimeout` - set VC disconnect timeout (in seconds)\n" +
            "`" +
            prefix +
            "setinstance` - set default Invidious instance\n" +
            "`" +
            prefix +
            "sethealth` - set minimum Invidious instance health",
        },
        {
          name: "Tags",
          value:
            "All tags commands start with `" +
            prefix +
            "tags`.\n" +
            "`create` - create a tag\n" +
            "`delete` - delete a tag\n" +
            "`list` - see all tags.",
        }
      );
    if (debug.debug === true)
      help.setFooter({
        text: `Build: ${version}\nInvidJS Version: ${
          require("../package-lock.json").packages[
            "node_modules/@invidjs/invid-js"
          ].version
        }\nOS: ${os.type()} ${os.release} ${
          os.arch
        }\nDebug Mode - For testing purposes only`,
      });
    message.channel.send({ embeds: [help] });
  },
};
