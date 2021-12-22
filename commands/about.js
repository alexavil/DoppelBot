const Discord = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
module.exports = {
	name: 'about',
	aliases: ['help'],
  description: 'About the bot',
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
				 .setTitle("Hi, I'm DoppelBot! :heart:")
				 .addField('How to use', 'If you need a random picture of Doppelganger Arle, I can help you with that. Use ' + row.prefix + 'doppel to start the magic.')
				 .addField('What else can I do?', "You can also use " + row.prefix + "doppelfact to get a random fact about Doppel, " + row.prefix + "spell if you want to hear a spell chant and " + row.prefix + "spelldesc to read a spell description. Mention me and I will respond with Doppel's quotes! :wink:")
				 .addField('Party commands', row.prefix + "createparty - create a party\n" + row.prefix + "joinparty - join a party by code\n" + row.prefix + "leaveparty - leave a party\n" + row.prefix + "endparty - destroy a party\n" + row.prefix + "makeleader - transfer leadership")
				 .addField('Music commands (WIP)', row.prefix + "play (p) - play music\n" + row.prefix + "search - search for music\n" + row.prefix + "stop - stop playing")
				 .setFooter('To view administrator commands, use ' + row.prefix + 'admhelp')
			 message.channel.send({ embeds: [help] });
		 });
	},
};
