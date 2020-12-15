const Discord = require('discord.js');
module.exports = {
	name: 'ban',
	description: 'Ban a user',
	execute(message, args) {
		if (!message.member.hasPermission('BAN_MEMBERS')) {
			return message.channel.send(`You don't have permission to use this command!`);
		}
		if (!args.length) {
			return message.channel.send(`Mention a user you want to ban!`);
		}
		if (args.length === 1) {
			return message.channel.send(`Provide a reason!`)
		}
		const user = message.mentions.users.first();
		var reason = "";
            for(i = 1; i < args.length; i++){
                var arg = args[i] + " "; 
                reason = reason + arg;
			}
		const banmessage = new Discord.MessageEmbed()
	.setColor('#FF0000')
	.setTitle('Important Message: You were banned from ' + message.guild.name)
	.addFields(
		{ name: 'Why was I banned?', value: reason },
		{ name: 'What does it mean for me?', value: 'You can no longer access ' + message.guild.name + ' unless your ban is revoked.' },
		{ name: 'How do I appeal?', value: 'Contact the Server Owner or a moderator that issued you the ban.' },
	)
	.setTimestamp()

	try {
		message.guild.members.ban(user);
		user.send(banmessage);
	} catch (error) {
		return message.channel.send(`Failed to ban **${user.tag}**: ${error}`);
	};
		
	},
};
