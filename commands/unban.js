const Discord = require('discord.js');
module.exports = {
	name: 'unban',
	description: 'Unban a user',
	userpermissions: 'BAN_MEMBERS',
	execute(message, args) {
		if (!args.length) {
			return message.channel.send(`Provide a user ID you want to unban!`);
        }
        if (args.length > 1) {
            return message.channel.send(`Too many arguments!`);
        }
        const id = args[0];
		try {
			message.guild.members.unban(id).catch(error => {
	if (error.code === Discord.Constants.APIErrors.MISSING_PERMISSIONS) {
		return message.reply("I don't have permissions to do that action! Check the Roles page!");
	}
	if ((!error) || (error.code != Discord.Constants.APIErrors.MISSING_PERMISSIONS)) {
		message.react('✅');
	}
});
		} catch (error) {
		 return message.channel.send(`Failed to unban: ${error}`);
	};
		
	},
};