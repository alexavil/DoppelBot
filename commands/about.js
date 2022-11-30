const Discord = require("discord.js");
const fs = require("fs");
module.exports = {
  name: "about",
  aliases: ["help"],
  description: "About the bot",
  execute(message) {
    id = message.guild.id;
    const guildconf = JSON.parse(fs.readFileSync("./guilds/" + id + ".json"));
    const help = new Discord.MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Hi, I'm DoppelBot! :heart:")
      .addField(
        "How to use",
        "If you need a random picture of Doppelganger Arle, I can help you with that. Use " +
          guildconf.prefix +
          "doppel to start the magic."
      )
      .addField(
        "What else can I do?",
        "You can also use " +
          guildconf.prefix +
          "doppelfact to get a random fact about Doppel, " +
          guildconf.prefix +
          "spell if you want to hear a spell chant and " +
          guildconf.prefix +
          "spelldesc to read a spell description. Mention me and I will respond with Doppel's quotes! :wink:"
      )
      .addField(
        "Party commands",
        guildconf.prefix +
          "createparty - create a party\n" +
          guildconf.prefix +
          "joinparty - join a party by code\n" +
          guildconf.prefix +
          "leaveparty - leave a party\n" +
          guildconf.prefix +
          "endparty - destroy a party\n" +
          guildconf.prefix +
          "makeleader - transfer leadership"
      )
      .addField(
        "Music commands (WIP)",
        guildconf.prefix +
          "play (p) - play music\n" +
          guildconf.prefix +
          "search - search for music\n" +
          guildconf.prefix +
          "stop - stop playing"
      )
      .setFooter(
        "To view administrator commands, use " + guildconf.prefix + "admhelp"
      );
    message.channel.send({ embeds: [help] });
  },
};
