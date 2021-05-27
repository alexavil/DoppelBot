const Discord = require('discord.js');
const fs = require('fs');
module.exports = {
	name: 'viewfilter',
  description: 'View filter',
  userpermissions: 'ADMINISTRATOR',
	 execute(message) {
		 id = message.guild.id;
	const guildconf = JSON.parse(fs.readFileSync('./filter/' + id + '.json'));
	console.log(guildconf);
	return message.reply('Your current filter: `' + guildconf.banned_words + '`');
	},
};