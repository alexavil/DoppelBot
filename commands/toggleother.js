const Discord = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
module.exports = {
	name: 'toggleother',
  description: 'Toggle other responses',
  aliases: ['other'],
  userpermissions: 'BAN_MEMBERS',
	execute(message) {
		id = message.guild.id;
		let settings = new sqlite3.Database('./guilds.db', (err) => {
			if (err) {
				console.error(err.message);
			}
			console.log('Connected to the settings database.');
		});
		settings.get('SELECT other FROM guilds WHERE id=?', [id], (err, row) => {
			if (err) {
				throw err;
			}
			if (row.other == "no") {
				settings.run(`UPDATE guilds SET other=? WHERE id=?`, [`yes`, id], function (err) {
					if (err) {
						return console.log(err.message);
					}
					message.reply('Misc responses are now **on**!');
				});

			}
			if (row.other == "yes") {
				settings.run(`UPDATE guilds SET other=? WHERE id=?`, [`no`, id], function (err) {
					if (err) {
						return console.log(err.message);
					}
					message.reply('Misc responses are now **off**!');
				});

			}
		});
	},
};