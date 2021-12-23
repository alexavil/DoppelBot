const Discord = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
module.exports = {
	name: 'setprefix',
	aliases: ['prefix'],
  description: 'Set guild prefix',
  userpermissions: 'BAN_MEMBERS',
	execute(message, args) {
		if (!args.length) {
			message.reply("Please provide a prefix!");
		}
		 id = message.guild.id;
		 let settings = new sqlite3.Database('./guilds.db', (err) => {
			 if (err) {
				 console.error(err.message);
			 }
			 console.log('Connected to the settings database.');
		 });
		settings.run(`UPDATE guilds SET prefix=? WHERE id=?`, [args[0], id], function (err) {
			if (err) {
				return console.log(err.message);
			}
			message.reply('New prefix set to ' + args[0] + '.');
		});
	
	},
};