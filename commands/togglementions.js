const Discord = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
module.exports = {
	name: 'togglementions',
  description: 'Toggle mention responses',
  aliases: ['mentions'],
  userpermissions: 'BAN_MEMBERS',
	execute(message) {
		id = message.guild.id;
		let settings = new sqlite3.Database('./guilds.db', (err) => {
			if (err) {
				console.error(err.message);
			}
			console.log('Connected to the settings database.');
		});
		settings.get('SELECT mentions FROM guilds WHERE id=?', [id], (err, row) => {
			if (err) {
				throw err;
			}
			if (row.mentions == "no") {
				settings.run(`UPDATE guilds SET mentions=? WHERE id=?`, [`yes`, id], function (err) {
					if (err) {
						return console.log(err.message);
					}
					message.reply('Mentions are now **on**!');
				});

			}
			if (row.mentions == "yes") {
				settings.run(`UPDATE guilds SET mentions=? WHERE id=?`, [`no`, id], function (err) {
					if (err) {
						return console.log(err.message);
					}
					message.reply('Mentions are now **off**!');
				});

			}
		});
	},
};