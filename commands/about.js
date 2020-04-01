const Discord = require('discord.js');
module.exports = {
	name: 'about',
  description: 'About the bot',
	execute(message) {
        
message.channel.send(`Hi, I'm DoppelBot! :heart:\nIf you need a random picture of Doppelganger Arie, I can help you with that.\nUse >doppel to start the magic.\n\nA Doppel a day keeps your sadness away! :smile:`)
	},
};
