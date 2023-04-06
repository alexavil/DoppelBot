const Discord = require("discord.js");
const sqlite3 = require("better-sqlite3");
const debug = require("../index");
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
            "All music commands start with `" +
            prefix +
            "music`.\n" +
            "`play` - play music\n" +
            "`suggest` - suggest search queries for a string\n" +
            "`search` - search for music\n" +
            "`pause` - pause the current track\n" +
            "`stop` - stop playing\n" +
            "`queue` - view the current queue\n" +
            "`skip` - skip the current track\n" +
            "`loop` - loop the current track.",
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
        text: `Build: ${version} (Debug Mode - For testing purposes only)`,
      });
    else help.setFooter({ text: `Build: ${version}` });
    message.channel.send({ embeds: [help] }).then(() => {
      if (debug.debug === true)
        console.log("[DEBUG] Successfully sent help message to " + id + "...");
    });
  },
};
