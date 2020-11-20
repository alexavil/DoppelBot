const Discord = require('discord.js');
module.exports = {
	name: 'say',
  description: 'Make the bot say something!',
	execute(message, args) {
  if (message.author.id === '332148103803174913') {
  let chl = message.mentions.channels.first();
  let msg = args.slice(1).join(" ");
        
  chl.send(msg);
  message.delete().catch();	  
}
	},
};
