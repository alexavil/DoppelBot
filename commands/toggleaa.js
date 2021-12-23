const Discord = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
module.exports = {
	name: 'toggleaa',
	aliases: ['aa'],
  description: 'Toggle Ace Attorney images',
  userpermissions: 'BAN_MEMBERS',
	 execute(message) {
		 id = message.guild.id;
		 let settings = new sqlite3.Database('./guilds.db', (err) => {
			 if (err) {
				 console.error(err.message);
			 }
			 console.log('Connected to the settings database.');
		 });
		 settings.get('SELECT aa FROM guilds WHERE id=?', [id], (err, row) => {
			 if (err) {
				 throw err;
			 }
			 if (row.aa == "no") {
				 settings.run(`UPDATE guilds SET aa=? WHERE id=?`, [`yes`, id], function (err) {
					 if (err) {
						 return console.log(err.message);
					 }
					 message.reply('Ace Attorney responses are now **on**!');
				 });
				 
			 }
			 if (row.aa == "yes") {
				 settings.run(`UPDATE guilds SET aa=? WHERE id=?`, [`no`, id], function (err) {
					 if (err) {
						 return console.log(err.message);
					 }
					 message.reply('Ace Attorney responses are now **off**!');
				 });
				 
			 }
		 });	
	},
};
