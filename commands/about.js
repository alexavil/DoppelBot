const Discord = require("discord.js");
const sqlite3 = require("better-sqlite3");
module.exports = {
  name: "about",
  aliases: ["help"],
  description: "About the bot",
  execute(message) {
    settings = new sqlite3("./settings.db");
    id = message.guild.id;
    let prefix = settings.prepare(`SELECT value FROM guild_${id} WHERE option = 'prefix'`).get().value;
    const help = new Discord.MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Hi, I'm DoppelBot! :heart:")
      .addField(
        "How to use",
        "If you need a random picture of Doppelganger Arle, I can help you with that. Use " +
          prefix +
          "doppel to start the magic."
      )
      .addField(
        "What else can I do?",
        "You can also use " +
          prefix +
          "doppelfact to get a random fact about Doppel, " +
          prefix +
          "spell if you want to hear a spell chant and " +
          prefix +
          "spelldesc to read a spell description. Mention me and I will respond with Doppel's quotes! :wink:"
      )
      .addField(
        "Music commands (WIP)",
        prefix +
          "play - play music\n" +
          prefix +
          "search - search for music\n" +
          prefix +
          "stop - stop playing"
      )
      .setFooter(
        "To view administrator commands, use " + prefix + "admhelp"
      );
    message.channel.send({ embeds: [help] });
  },
};
