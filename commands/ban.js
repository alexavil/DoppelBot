const Discord = require('discord.js');
module.exports = {
	name: 'ban',
	description: 'Ban a user',
	userpermissions: 'BAN_MEMBERS',
	execute(message, args) {
		if (!args.length) {
			return message.channel.send(`Mention a user you want to ban!`);
		}
		if (args.length === 1) {
			return message.channel.send(`Provide a reason!`)
		}
		const user = message.mentions.users.first() || message.guild.members.get(args[0]);
		if (!message.guild.member(user).bannable) return message.reply("I don't have permissions to do that action! Check the Roles page!");
		var reason = "";
            for(i = 1; i < args.length; i++){
                var arg = args[i] + " "; 
                reason = reason + arg;
			}
		const banmessage = new Discord.MessageEmbed()
	.setColor('#FF0000')
	.setTitle('Important Message: You were banned from ' + message.guild.name)
	.addField('Why was I banned?', reason)
	.addField('What does it mean for me?', 'You can no longer access ' + message.guild.name + ' unless your ban is revoked.')
	.addField('How do I appeal?', 'Contact the Server Owner or a moderator that issued you the ban.')
	.setTimestamp()
	try {
				user.send(banmessage).catch(error => {
	if (error.code === Discord.Constants.APIErrors.CANNOT_MESSAGE_USER) {
		return message.reply("I couldn't message the user, but they were banned successfully!");
	} 
});
		message.guild.members.ban(user, {reason: reason})
		message.react('✅');
	} catch (error) {
		 return message.channel.send(`Failed to ban **${user.tag}**: ${error}`);
	};
		
	},
};