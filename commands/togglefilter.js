const Discord = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
module.exports = {
	name: 'togglefilter',
	aliases: ['filter'],
  description: 'Toggle filter',
  userpermissions: 'BAN_MEMBERS',
	execute(message) {
		id = message.guild.id;
		let settings = new sqlite3.Database('./settings.db', (err) => {
			if (err) {
				console.error(err.message);
			}
			console.log('Connected to the settings database.');
		});
		settings.get('SELECT filter FROM guilds WHERE id=?', [id], (err, row) => {
			if (err) {
				throw err;
			}
			if (row.filter == "no") {
				settings.run(`UPDATE guilds SET filter=? WHERE id=?`, [`yes`, id], function (err) {
					if (err) {
						return console.log(err.message);
					}
					message.reply('Filter is now **on**!');
				});

			}
			if (row.filter == "yes") {
				settings.run(`UPDATE guilds SET filter=? WHERE id=?`, [`no`, id], function (err) {
					if (err) {
						return console.log(err.message);
					}
					message.reply('Filter is now **off**!');
				});

			}
		});
	},
};