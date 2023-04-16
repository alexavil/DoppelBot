const Discord = require("discord.js");
const sqlite3 = require("better-sqlite3");
const debug = require("../index");
const os = require("os");
module.exports = {
  name: "about",
  aliases: ["help"],
  description: "About the bot",
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
          name: "Music commands",
          value:
            "`" +
            prefix +
            "play` - play music\n" +
            "`" +
            prefix +
            "suggest` - suggest search queries for a string\n" +
            "`" +
            prefix +
            "search` - search for music\n" +
            "`" +
            prefix +
            "pause` - pause the current track\n" +
            "`" +
            prefix +
            "stop` - stop playing\n" +
            "`" +
            prefix +
            "queue` - view the current queue\n" +
            "`" +
            prefix +
            "skip` - skip the current track\n" +
            "`" +
            prefix +
            "loop` - loop the current track\n" +
            "`" +
            prefix +
            "seek` - view the current position of a song",
        },
        {
          name: "Tags",
          value:
            "Certain servers may use key phrases and give out a response! You can view all the tags with `" +
            prefix +
            "tags list`.",
        }
      );
    if (debug.debug === true)
      help.setFooter({
        text: `Build: ${version}\nOS: ${os.type()} ${os.release} ${
          os.arch
        }\nDebug Mode - For testing purposes only`,
      });
    message.channel.send({ embeds: [help] });
  },
};
