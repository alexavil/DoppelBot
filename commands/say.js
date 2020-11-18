const Discord = require('discord.js');
module.exports = {
	name: 'say',
  description: 'Make the bot say something!',
	execute(message) {
  if (message.author.id === '332148103803174913') {
        
  message.channel.send(message.content.split(" ").slice(1).join(" "));
  message.delete().catch();
},
	},
};
