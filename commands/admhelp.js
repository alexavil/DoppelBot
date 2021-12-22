const Discord = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
module.exports = {
	name: 'admhelp',
  description: 'About the bot - for admins',
	 execute(message) {
	id = message.guild.id;
		 let settings = new sqlite3.Database('./guilds.db', (err) => {
			 if (err) {
				 console.error(err.message);
			 }
			 console.log('Connected to the settings database.');
		 });
		 settings.get('SELECT prefix FROM guilds WHERE id=?', [id], (err, row) => {
			 if (err) {
				 throw err;
			 }
			 const help = new Discord.MessageEmbed()
				 .setColor('#0099ff')
				 .setTitle("DoppelBot's Administrator commands")
				 .addField('Moderation commands', row.prefix + "ban - ban a user\n" + row.prefix + "unban - unban a user\n" + row.prefix + "warn - issue a warning\n" + row.prefix + "kick - kick a user")
				 .addField('Server settings', row.prefix + "settings - view settings\n" + row.prefix + "toggleaa (aa) - toggle Ace Attorney images\n" + row.prefix + "togglementions (mentions) - toggle mention responses\n" + row.prefix + "toggleother (other) - toggle other responses\n" + row.prefix + "setprefix (prefix) - set guild prefix\n" + row.prefix + "togglefilter (filter) - toggle word filter\n" + row.prefix + "togglegb (gb) - toggle global bans")
				 .addField('Filter management', row.prefix + "filteradd - add words to filter (accepts multiple arguments)\n" + row.prefix + "filterremove - remove words from filter (accepts multiple arguments)\n" + row.prefix + "viewfilter - view current filter")
			 message.channel.send({ embeds: [help] });
		 });   
	},
};