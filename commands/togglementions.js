const Discord = require('discord.js');
const fs = require('fs');
module.exports = {
	name: 'togglementions',
  description: 'Toggle mention responses',
  userpermissions: 'ADMINISTRATOR',
	 execute(message) {
		 id = message.guild.id;
	const guildconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	console.log(guildconf);
	if (guildconf.mentions == "inactive") {
		var stream = fs.createWriteStream('./guilds/' + id + '.json');
		stream.once('open', (fd) => {
		stream.write("{\n");
		stream.write(`"aa": "` + guildconf.aa +`",\n`);
		stream.write(`"mentions": "active",\n`);
		stream.write(`"other": "` + guildconf.other +`",\n`);
		stream.write(`"prefix": "` + guildconf.prefix +`",\n`);
		stream.write(`"filter": "` + guildconf.filter +`"\n`);
		stream.write("}");
		stream.end();
});
	const guildnewconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	message.reply('Mention responses are now **on**!');
	}
	if (guildconf.mentions == "active") {
		var stream = fs.createWriteStream('./guilds/' + id + '.json');
		stream.once('open', (fd) => {
		stream.write("{\n");
		stream.write(`"aa": "` + guildconf.aa +`",\n`);
		stream.write(`"mentions": "inactive",\n`);
		stream.write(`"other": "` + guildconf.other +`",\n`);
		stream.write(`"prefix": "` + guildconf.prefix +`",\n`);
		stream.write(`"filter": "` + guildconf.filter +`"\n`);		
		stream.write("}");
		stream.end();
});
	const guildnewconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	message.reply('Mention responses are now **off**!');
	}	
	},
};