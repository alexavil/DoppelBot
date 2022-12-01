const Discord = require("discord.js");
const sqlite3 = require("better-sqlite3");
module.exports = {
  name: "about",
  aliases: ["help"],
  description: "About the bot",
  execute(message) {
    const settings = new sqlite3("./settings.db");
    let id = message.guild.id;
    let prefix = settings
      .prepare(`SELECT value FROM guild_${id} WHERE option = 'prefix'`)
      .get().value;
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
        "Music commands",
        "All music commands start with " + prefix + "music.\n" +
          "play - play music\n" +
          "search - search for music\n" +
          "stop - stop playing\n" +
          "queue - view the current queue\n" +
          "skip - skip the current track."
      );
    message.channel.send({ embeds: [help] });
  },
};
