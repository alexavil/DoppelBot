const Discord = require('discord.js');
const fs = require('fs');
module.exports = {
	name: 'toggleother',
  description: 'Toggle other responses',
  userpermissions: 'ADMINISTRATOR',
	 execute(message) {
		 id = message.guild.id;
	const guildconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	console.log(guildconf);
	if (guildconf.other == "inactive") {
		var stream = fs.createWriteStream('./guilds/' + id + '.json');
		stream.once('open', (fd) => {
		stream.write("{\n");
		stream.write(`"aa": "` + guildconf.aa +`",\n`);
		stream.write(`"mentions": "` + guildconf.mentions +`",\n`);
		stream.write(`"other": "active",\n`);
		stream.write(`"prefix": "` + guildconf.prefix +`",\n`);
		stream.write(`"filter": "` + guildconf.filter +`"\n`);		
		stream.write("}");
		stream.end();
});
	const guildnewconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	message.reply('Other responses are now **on**!');
	}
	if (guildconf.other == "active") {
		var stream = fs.createWriteStream('./guilds/' + id + '.json');
		stream.once('open', (fd) => {
		stream.write("{\n");
		stream.write(`"aa": "` + guildconf.aa +`",\n`);
		stream.write(`"mentions": "` + guildconf.mentions +`",\n`);
		stream.write(`"other": "inactive",\n`);
		stream.write(`"prefix": "` + guildconf.prefix +`",\n`);
		stream.write(`"filter": "` + guildconf.filter +`"\n`);		
		stream.write("}");
		stream.end();
});
	const guildnewconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	message.reply('Other responses are now **off**!');
	}	
	},
};