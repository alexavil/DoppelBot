const Discord = require("discord.js");
module.exports = {
  name: "warn",
  description: "Warn a user",
  userpermissions: "KICK_MEMBERS",
  execute(message, args) {
    if (!args.length) {
      return message.channel.send(`Mention a user you want to warn!`);
    }
    if (args.length === 1) {
      return message.channel.send(`Provide a reason!`);
    }
    const user =
      message.mentions.users.first() ||
      message.guild.members.cache.get(args[0]);
    let reason = "";
    for (let i = 1; i < args.length; i++) {
      let arg = args[i] + " ";
      reason = reason + arg;
    }
    const warnmessage = new Discord.MessageEmbed()
      .setColor("#00FF00")
      .setTitle("Important Message: You were warned in " + message.guild.name)
      .addField("Why was I warned?", reason)
      .addField(
        "What does it mean for me?",
        "You can continue chatting safely, however, more infractions will lead to more serious penalties."
      )
      .addField(
        "How do I appeal?",
        "Contact the Server Owner or a moderator that kicked you."
      )
      .setTimestamp();
    try {
      user.send({ embeds: [warnmessage] }).catch((error) => {
        if (error.code === Discord.Constants.APIErrors.CANNOT_MESSAGE_USER) {
          return message.reply(
            "I couldn't message the user, but they were warned successfully!"
          );
        }
      });
      message.react("✅");
    } catch (error) {
      return message.channel.send(`Failed to warn **${user.tag}**: ${error}`);
    }
  },
};
