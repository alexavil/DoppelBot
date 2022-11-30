const Discord = require("discord.js");
module.exports = {
  name: "kick",
  description: "Kick a user",
  userpermissions: "KICK_MEMBERS",
  execute(message, args) {
    if (!args.length) {
      return message.channel.send(`Mention a user you want to kick!`);
    }
    if (args.length === 1) {
      return message.channel.send(`Provide a reason!`);
    }
    const user =
      message.mentions.users.first() ||
      message.guild.members.cache.get(args[0]);
    if (!message.guild.members.cache.get(user.id).bannable)
      return message.reply(
        "I don't have permissions to do that action! Check the Roles page!"
      );
    let reason = "";
    for (let i = 1; i < args.length; i++) {
      let arg = args[i] + " ";
      reason = reason + arg;
    }
    async function kick() {
      const delay = (msec) =>
        new Promise((resolve) => setTimeout(resolve, msec));
      user.send({ embeds: [kickmessage] }).catch((err) => {
        if (err.code === Discord.Constants.APIErrors.CANNOT_MESSAGE_USER) {
          return message.reply(
            "I couldn't send the message, but the user was kicked successfully!"
          );
        }
      });
      await delay(100);
      let kickmember = message.guild.members.cache.get(user.id);
      kickmember.kick(reason);
      message.react("✅");
    }
    const kickmessage = new Discord.MessageEmbed()
      .setColor("#FFFF00")
      .setTitle("Important Message: You were kicked from " + message.guild.name)
      .addField("Why was I kicked?", reason)
      .addField(
        "What does it mean for me?",
        "You were removed from " +
          message.guild.name +
          ". You can still re-join by using any available invite link, however, your roles will be reset. More infractions will lead to more serious penalties."
      )
      .addField(
        "How do I appeal?",
        "Contact the Server Owner or a moderator that kicked you."
      )
      .setTimestamp();
    try {
      kick();
    } catch (error) {
      return message.channel.send(`Failed to kick **${user.tag}**: ${error}`);
    }
  },
};
