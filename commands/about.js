const Discord = require('discord.js');
const { Client, RichEmbed, Permissions, PermissionOverwrites, GuildMember, } = require('discord.js');
module.exports = {
	name: 'about',
  description: 'About the bot',
	 execute(message) {
        const help = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle("Hi, I'm DoppelBot! :heart:")
		.setDescription('')
		.addFields(
			{ name: 'Info', value: "If you need a random picture of Doppelganger Arie, I can help you with that. Use d!doppel to start the magic.\n\nd!doppelfact - get a random fact about Doppel\nd!spell - hear a spell chant\nd!spelldesc - read a spell description\n\nMention me and I will respond with Doppel's quotes! :wink:\n\nA Doppel a day keeps your sadness away! :smile:" },
		)
		.setTimestamp()
	    message.channel.send(help);
		message.delete().catch();
	},
};