const Discord = require('discord.js');
module.exports = {
	name: 'about',
  description: 'About the bot',
	 execute(message) {
        const help = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle("Hi, I'm DoppelBot! :heart:")
	.addField('How to use', 'If you need a random picture of Doppelganger Arle, I can help you with that. Use d!doppel to start the magic.')
	.addField('What else can I do?', "You can also use d!doppelfact to get a random fact about Doppel, d!spell if you want to hear a spell chant and d!spelldesc to read a spell description. Mention me and I will respond with Doppel's quotes! :wink:")
	.addField('Party commands', "d!createparty - create a party\nd!joinparty - join a party by code\nd!leaveparty - leave a party\nd!endparty - destroy a party\nd!makeleader - transfer leadership")
	.addField('Moderation commands', "d!ban - ban a user\nd!unban - unban a user\nd!warn - issue a warning\nd!kick - kick a user")
	.addField('Music commands (WIP)', "d!play - play music\nd!stop - stop playing")
    message.channel.send(help);
	},
};
