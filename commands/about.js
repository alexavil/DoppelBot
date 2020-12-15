const Discord = require('discord.js');
module.exports = {
	name: 'about',
  description: 'About the bot',
	 execute(message) {
        const help = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Welcome to DoppelBot!')
		.setDescription('')
		.addFields(
			{ name: 'Info', value: 'If you need a random picture of Doppelganger Arie, I can help you with that. Use d!doppel to start the magic.' },
			{ name: 'Commands', value: 'd!doppel - send a Doppel picture\nd!doppelfact - get a random fact about Doppel\nd!spell - hear a spell chant\nd!spelldesc - read a spell description\nd!ban (user) (reason) - ban a user\nd!kick (user) (reason) - kick a user\nd!warn (user) (reason) - warn a user\nd!unban (user ID) - remove a ban' },
		)
		.setTimestamp()
	    message.channel.send(help);
	},
};
