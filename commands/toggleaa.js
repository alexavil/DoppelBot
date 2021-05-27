const Discord = require('discord.js');
const fs = require('fs');
module.exports = {
	name: 'toggleaa',
  description: 'Toggle Ace Attorney images',
  userpermissions: 'ADMINISTRATOR',
	 execute(message) {
		 id = message.guild.id;
	const guildconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	console.log(guildconf);
	if (guildconf.aa == "inactive") {
		var stream = fs.createWriteStream('./guilds/' + id + '.json');
		stream.once('open', (fd) => {
		stream.write("{\n");
		stream.write(`"aa": "active",\n`);
		stream.write(`"mentions": "` + guildconf.mentions +`",\n`);
		stream.write(`"other": "` + guildconf.other +`",\n`);
		stream.write(`"prefix": "` + guildconf.prefix +`",\n`);
		stream.write(`"filter": "` + guildconf.filter +`"\n`);
		stream.write("}");
		stream.end();
});
	const guildnewconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	message.reply('Ace Attorney responses are now **on**!');
	}
	if (guildconf.aa == "active") {
		var stream = fs.createWriteStream('./guilds/' + id + '.json');
		stream.once('open', (fd) => {
		stream.write("{\n");
		stream.write(`"aa": "inactive",\n`);
		stream.write(`"mentions": "` + guildconf.mentions +`",\n`);
		stream.write(`"other": "` + guildconf.other +`",\n`);
		stream.write(`"prefix": "` + guildconf.prefix +`",\n`);
		stream.write(`"filter": "` + guildconf.filter +`"\n`);		
		stream.write("}");
		stream.end();
});
	const guildnewconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	message.reply('Ace Attorney responses are now **off**!');
	}	
	},
};
