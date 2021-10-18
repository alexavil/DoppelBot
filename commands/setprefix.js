const Discord = require('discord.js');
const fs = require('fs');
module.exports = {
	name: 'setprefix',
  description: 'Set guild prefix',
  userpermissions: 'BAN_MEMBERS',
	 execute(message, args) {
		 id = message.guild.id;
	const guildconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	console.log(guildconf);
	if (!args.length) {
		message.reply("Please provide a prefix!");
	}
		var stream = fs.createWriteStream('./guilds/' + id + '.json');
		stream.once('open', (fd) => {
		stream.write("{\n");
		stream.write(`"aa": "` + guildconf.aa +`",\n`);
		stream.write(`"mentions": "` + guildconf.mentions +`",\n`);
		stream.write(`"other": "` + guildconf.other +`",\n`);
		stream.write(`"prefix": "` + args[0] +`",\n`);
		stream.write(`"filter": "` + guildconf.filter +`",\n`);
		stream.write(`"global_bans": "` + guildconf.global_bans +`"\n`);		
		stream.write("}");
		stream.end();
});
	message.reply('New prefix set to ' + args[0] + '.');
	},
};