const Discord = require('discord.js');
const { Client, MessageEmbed, Permissions, PermissionOverwrites, GuildMember, MessageAttachment, Intents } = require('discord.js');
const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_TYPING] });
module.exports = {
	name: 'joinparty',
  description: 'Join a party',
	 execute(message, args) {
		if (!args.length) {
            return message.channel.send ('Provide a code!');
        }
        if (args.length > 1) {
            return message.channel.send ("You can't join multiple parties!");
        }
        if (args.length === 1) {
            console.log(message.channel.topic);
            code = args[0];
            message.guild.channels.cache.forEach(async channel => {
                if ((channel.type === "category") || (channel.type === "voice") || (channel.topic === null)) return;
                console.log(channel);
                console.log(channel.topic);
                if (channel.topic.startsWith("Party code: " + code)) {
                    channel.send(message.author.tag + ' has joined the party!');
                    message.delete();
                    return channel.overwritePermissions(message.author.id, { VIEW_CHANNEL: true });
                }
            });
            }
        }
	};