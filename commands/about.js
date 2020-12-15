const Discord = require('discord.js');
module.exports = {
	name: 'about',
  description: 'About the bot',
	 execute(message) {
        const help = new Discord.RichEmbed()
	.setColor('#0099ff')
	.setTitle("Hi, I'm DoppelBot! :heart:")
	.addField('How to use', 'If you need a random picture of Doppelganger Arie, I can help you with that. Use d!doppel to start the magic.')
	.addField('What else can I do?', "You can also use d!doppelfact to get a random fact about Doppel, d!spell if you want to hear a spell chant and d!spelldesc to read a spell description. Mention me and I will respond with Doppel's quotes! :wink:")
    message.channel.send(help);
	},
};
