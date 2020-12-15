const Discord = require('discord.js');
module.exports = {
	name: 'warn',
	description: 'Warn a user',
	execute(message, args) {
		if (!message.member.hasPermission('KICK_MEMBERS')) {
			return message.channel.send(`You don't have permission to use this command!`);
		}
		if (!args.length) {
			return message.channel.send(`Mention a user you want to warn!`);
		}
		if (args.length === 1) {
			return message.channel.send(`Provide a reason!`);
		}
		const user = message.mentions.users.first();
		var reason = "";
            for(i = 1; i < args.length; i++){
                var arg = args[i] + " "; 
                reason = reason + arg;
			}
		const warnmessage = new Discord.RichEmbed()
	.setColor('#00FF00')
	.setTitle('Important Message: You were warned in ' + message.guild.name)
	.addField('Why was I warned?', reason)
    .addField('What does it mean for me?', 'You can continue chatting safely, however, more infractions will lead to more serious penalties.')
	.addField('How do I appeal?', 'Contact the Server Owner or a moderator that issued you the warning.')
	)
	.setTimestamp()

		user.send(warnmessage);
		setTimeout(() => {
			message.channel.send('Warned! :white_check_mark:');
		  }, 500)
		
	},
};
