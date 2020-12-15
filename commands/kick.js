const Discord = require('discord.js');
module.exports = {
	name: 'kick',
	description: 'Kick a user',
	execute(message, args) {
		if (!message.author.hasPermission('KICK_MEMBERS')) {
			return message.channel.send(`You don't have permission to use this command!`);
		}
		if (!args.length) {
			return message.channel.send(`Mention a user you want to kick!`);
		}
		if (args.length === 1) {
			return message.channel.send(`Provide a reason!`)
		}
		const user = message.mentions.members.first();
		var reason = "";
            for(i = 1; i < args.length; i++){
                var arg = args[i] + " "; 
                reason = reason + arg;
			}
			const kickmessage = new Discord.RichEmbed()
	.setColor('#FF0000')
	.setTitle('Important Message: You were kicked from ' + message.guild.name)
	.addField('Why was I kicked?', reason)
	.addField('What does it mean for me?', 'You were removed from ' + message.guild.name + '. You can still re-join by using any available invite link, however, your roles will be reset. More infractions will lead to more serious penalties.')
	.addField('How do I appeal?', 'Contact the Server Owner or a moderator that kicked you.')
	.setTimestamp()


	try {
		message.guild.kick(user);
		user.send(kickmessage);
	} catch (error) {
		return message.channel.send(`Failed to kick **${user.tag}**: ${error}`);
	};
		
	},
};
