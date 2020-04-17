const Discord = require('discord.js');
module.exports = {
	name: 'about',
  description: 'About the bot',
	execute(message) {
        
message.channel.send(`Hi, I'm DoppelBot! :heart:\nIf you need a random picture of Doppelganger Arie, I can help you with that.\nUse >doppel to start the magic.\n\nYou can also use >doppelfact to get a random fact about Doppel, >spell if you want to hear a spell chant and >spelldesc to read a spell's description.\nMention me and I will respond with Doppel's quotes! :wink:\n\nA Doppel a day keeps your sadness away! :smile:`)
	},
};
