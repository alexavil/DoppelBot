const Discord = require('discord.js');
const fs = require('fs');
module.exports = {
	name: 'doppelfact',
  description: 'Get a random Doppel fact',
	execute(message) {
		const responses = JSON.parse(fs.readFileSync('./responses.json'));
		message.delete().catch();

    const facts = responses.facts;
        
message.channel.send(facts[Math.floor(Math.random() * facts.length)]);
	},
};
