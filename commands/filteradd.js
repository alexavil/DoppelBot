const Discord = require('discord.js');
const fs = require('fs');
module.exports = {
	name: 'filteradd',
  description: 'Manage filter',
  userpermissions: 'ADMINISTRATOR',
	 execute(message, args) {
		 id = message.guild.id;
	//Get the database
		let settings = new sqlite3.Database('./settings.db', (err) => {
			if (err) {
				console.error(err.message);
			}
			console.log('Connected to the settings database.');
		});
	if(!args.length) {
		return message.reply('Provide at least one word or string!');
	}
	if(args.length == 1) {
		//Get the existing filter and push a new word to it
		//The filter is an array of words
		settings.get('SELECT filter FROM filters WHERE id=?', [id], (err, row) => {
			if (err) {
				throw err;
			}
			//If the filter includes the word, return
			if (row.filter.includes(args[0])) {
				return message.reply('That word is already in the filter!');
			}
			if (row.filter == "") {
				settings.run(`INSERT INTO filters (id, filter) VALUES (?, ?)`, [id, args[0]], function (err) {
					if (err) {
						return console.log(err.message);
					}
					message.reply(`Added ${args[0]} to the filter!`);
				});
			}
			if (row.filter != "") {
				settings.run(`UPDATE filters SET filter=? WHERE id=?`, [row.filter + "," + args[0], id], function (err) {
					if (err) {
						return console.log(err.message);
					}
					message.reply(`Added ${args[0]} to the filter!`);
				});
			}
		});
	return message.reply('Added!');
	}
	if(args.length > 1) {
		args.forEach(item => {
			settings.get('SELECT filter FROM filters WHERE id=?', [id], (err, row) => {
				if (err) {
					throw err;
				}
				//If the filter includes the word, return
				if (row.filter.includes(item)) {
					return console.log('That word is already in the filter!');
				}
					settings.run(`UPDATE filters SET filter=? WHERE id=?`, [row.filter + "," + item, id], function (err) {
						if (err) {
							return console.log(err.message);
						}
						console.log(`Added ${args[0]} to the filter!`);
					});
			});
	});
	return message.reply('Added!');
	}	
	
	},
};