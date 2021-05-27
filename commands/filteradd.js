const Discord = require('discord.js');
const fs = require('fs');
module.exports = {
	name: 'filteradd',
  description: 'Manage filter',
  userpermissions: 'ADMINISTRATOR',
	 execute(message, args) {
		 id = message.guild.id;
	const guildconf = JSON.parse(fs.readFileSync('./filter/' + id + '.json'));
	console.log(guildconf);
	if(!args.length) {
		return message.reply('Provide at least one word or string!');
	}
	if(args.length == 1) {
			oldfilter = JSON.parse(fs.readFileSync('./filter/' + id + '.json'));
			console.log(oldfilter);
			if (oldfilter.banned_words.includes(args[0])) {
				return message.reply('This word is already filtered!');
			}
			newfilter = oldfilter.banned_words.push(args[0]);
			console.log(newfilter);
			let data = JSON.stringify(oldfilter);
			fs.writeFileSync('./filter/' + id + '.json', data, (err) => {
			if (err) {
				throw err;
			} else {
			console.log("item written successfully.");
		
    }
  });
  return message.reply('Added!');
	}
	if(args.length > 1) {
		args.forEach(item => {
			oldfilter = JSON.parse(fs.readFileSync('./filter/' + id + '.json'));
			console.log(oldfilter);
			if (oldfilter.banned_words.includes(item)) {
				return console.log('This word is already filtered!');
			}
			newfilter = oldfilter.banned_words.push(item);
			console.log(newfilter);
			let data = JSON.stringify(oldfilter);
			fs.writeFileSync('./filter/' + id + '.json', data, (err) => {
			if (err) {
				throw err;
			} else {
			console.log("item written successfully.");
    }
  });
	});
	return message.reply('Added!');
	}	
	
	},
};