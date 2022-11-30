const Discord = require("discord.js");
const {
  Client,
  MessageEmbed,
  Permissions,
  PermissionOverwrites,
  GuildMember,
  MessageAttachment,
  Intents,
} = require("discord.js");
const client = new Discord.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_WEBHOOKS,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING,
  ],
});
module.exports = {
  name: "leaveparty",
  description: "Leave a party",
  execute(message) {
    if (
      message.channel.topic === null ||
      !message.channel.name.startsWith("party-")
    ) {
      message.delete();
      return message.channel.send("This is not a valid party.");
    }
    let topic = message.channel.topic;
    user = topic.substr(26);
    console.log(user);
    if (
      message.channel.topic.endsWith("Leader: " + user) &&
      user != message.author.tag
    ) {
      message.channel.send(message.author.tag + " has left the party!");
      message.delete();
      return message.channel.overwritePermissions(message.author.id, {
        VIEW_CHANNEL: false,
      });
    } else {
      message.delete();
      return message.channel.send(
        "You cannot leave your own party. Use d!endparty to leave it."
      );
    }
  },
};
