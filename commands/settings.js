const Discord = require('discord.js');
const fs = require('fs');
module.exports = {
	name: 'settings',
  description: 'Show server settings',
  userpermissions: 'BAN_MEMBERS',
	 execute(message) {
	id = message.guild.id;
	const guildconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	console.log(guildconf);
    const settings = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle("Server Settings for " + message.guild.name)
	.addField('**Ace Attorney responses**', guildconf.aa)
	.addField('**Mention responses**', guildconf.mentions)
	.addField('**Other responses**', guildconf.other)
	.addField('**Guild prefix**', guildconf.prefix)
	.addField('**Word filter**', guildconf.filter)
	.addField('**Global Bans**', guildconf.global_bans)	
    message.channel.send({ embeds: [settings]} );
	},
};
