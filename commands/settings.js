const Discord = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
module.exports = {
	name: 'settings',
  description: 'Show server settings',
  userpermissions: 'BAN_MEMBERS',
	 execute(message) {
	id = message.guild.id;
		 let settings = new sqlite3.Database('./guilds.db', (err) => {
			 if (err) {
				 console.error(err.message);
			 }
			 console.log('Connected to the settings database.');
		 });
		 settings.get('SELECT * FROM guilds WHERE id=?', [id], (err, row) => {
			 if (err) {
				 throw err;
			 }
			 const settingsmsg = new Discord.MessageEmbed()
				 .setColor('#0099ff')
				 .setTitle("Server Settings for " + message.guild.name)
				 .addField('**Ace Attorney responses**', row.aa)
				 .addField('**Mention responses**', row.mentions)
				 .addField('**Other responses**', row.other)
				 .addField('**Guild prefix**', row.prefix)
				 .addField('**Word filter**', row.filter)
			 message.channel.send({ embeds: [settingsmsg] });
		 });
	},
};
