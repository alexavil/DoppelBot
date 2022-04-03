const Discord = require('discord.js');
const fs = require('fs');
module.exports = {
	name: 'viewfilter',
  description: 'View filter',
  userpermissions: 'BAN_MEMBERS',
	 execute(message) {
		 id = message.guild.id;
		//Pull the server filter from the settings database
		let settings = new sqlite3.Database('./settings.db', (err) => {
			if (err) {
				console.error(err.message);
			}
			console.log('Connected to the settings database.');
		});
		//Display the filter contents (from the filters table)
		settings.get('SELECT filter FROM filters WHERE id=?', [id], (err, row) => {
			if (err) {
				throw err;
			}
			if (row.filter == "") {
				message.reply('There is no filter set!');
			}
			if (row.filter != "") {
				message.reply(`The filter is: ${row.filter}`);
			}
		});
	},
};