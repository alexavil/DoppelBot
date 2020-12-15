const Discord = require('discord.js');
module.exports = {
	name: 'unban',
	description: 'Unban a user',
	execute(message, args) {
		if (!message.author.hasPermission('BAN_MEMBERS')) {
			return message.channel.send(`You don't have permission to use this command!`);
		}
		if (!args.length) {
			return message.channel.send(`Provide a user ID you want to unban!`);
        }
        if (args.length > 1) {
            return message.channel.send(`Too many arguments!`);
        }
        const id = args[0];
		setTimeout(() => {
			message.guild.unban(id);
			message.channel.send('Unbanned! :white_check_mark:');
		  }, 500)
		
	},
};
