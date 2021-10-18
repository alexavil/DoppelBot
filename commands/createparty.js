const Discord = require('discord.js');
const { Client, MessageEmbed, Permissions, PermissionOverwrites, GuildMember, MessageAttachment, Intents } = require('discord.js');
const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_TYPING] });
module.exports = {
	name: 'createparty',
  description: 'Create a party',
	 execute(message) {
		function randomInt(min, max) {
			return min + Math.floor((max - min) * Math.random());
		  }
		  id = randomInt(1, 999);
		  chname = "party-" + id.toString();
		  code = randomInt(1000, 9999);
		message.guild.channels.create(chname, {
			type: 'text',
			topic: 'Party code: ' + code + ". Leader: " + message.author.tag,
			permissionOverwrites: [
				{
					id: message.guild.id,
					deny: ['VIEW_CHANNEL'],
				},
				{
					id: message.author.id,
					allow: ['VIEW_CHANNEL', 'MANAGE_MESSAGES'],
				},
			],
		});
			message.author.send('Your party (' +  chname + ') code: ' + code + '.').catch(error => {
				if (error.code === 50007) {
					console.error('Failed to send the message:', error);
					return message.author.send('I could not send you the code. Look it up in your new channel topic.');
				}
			});
			message.delete();		
	},
};
