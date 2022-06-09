const Discord = require("discord.js");
const fs = require("fs");
module.exports = {
  name: "admhelp",
  description: "About the bot - for admins",
  execute(message) {
    id = message.guild.id;
    const guildconf = JSON.parse(fs.readFileSync("./guilds/" + id + ".json"));
    const help = new Discord.MessageEmbed()
      .setColor("#0099ff")
      .setTitle("DoppelBot's Administrator commands")
      .addField(
        "Moderation commands",
        guildconf.prefix +
          "ban - ban a user\n" +
          guildconf.prefix +
          "unban - unban a user\n" +
          guildconf.prefix +
          "warn - issue a warning\n" +
          guildconf.prefix +
          "kick - kick a user"
      )
      .addField(
        "Server settings",
        guildconf.prefix +
          "settings - view settings\n" +
          guildconf.prefix +
          "toggleaa (aa) - toggle Ace Attorney images\n" +
          guildconf.prefix +
          "togglementions (mentions) - toggle mention responses\n" +
          guildconf.prefix +
          "toggleother (other) - toggle other responses\n" +
          guildconf.prefix +
          "setprefix (prefix) - set guild prefix\n" +
          guildconf.prefix +
          "togglefilter (filter) - toggle word filter\n" +
          guildconf.prefix +
          "togglegb (gb) - toggle global bans"
      )
      .addField(
        "Filter management",
        guildconf.prefix +
          "filteradd - add words to filter (accepts multiple arguments)\n" +
          guildconf.prefix +
          "filterremove - remove words from filter (accepts multiple arguments)\n" +
          guildconf.prefix +
          "viewfilter - view current filter"
      );
    message.channel.send({ embeds: [help] });
  },
};
