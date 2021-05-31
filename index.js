const fs = require('fs');
const Discord = require('discord.js');
const cron = require("cron");
const { Client, MessageEmbed, Permissions, PermissionOverwrites, GuildMember, MessageAttachment } = require('discord.js');

const client = new Discord.Client();
const disbut = require('discord-buttons')(client);
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}



client.on('ready', () => {
  console.log('I am ready!')
client.user.setPresence({
    status: "online",
    activity: {
        name: `Super Sonic Maker`,
    },
});
function createConfig() {
	client.guilds.cache.forEach(g => {
		fs.access('./guilds/' + g.id + '.json', (err) => {
		if (err) {
		var stream = fs.createWriteStream('./guilds/' + g.id + '.json');
		stream.once('open', (fd) => {
		stream.write("{\n");
		stream.write(`"aa": "inactive",\n`);
		stream.write(`"mentions": "active",\n`);
		stream.write(`"other": "inactive",\n`);
		stream.write(`"prefix": "d!",\n`);
		stream.write(`"filter": "active"\n`);
		stream.write("}");
		stream.end();
});
		}
		})
		fs.access('./filter/' + g.id + '.json', (err) => {
		if (err) {
		var stream = fs.createWriteStream('./filter/' + g.id + '.json');
		stream.once('open', (fd) => {
		stream.write("{\n");
		stream.write(`"banned_words": ["https://discordgift.site/"]\n`);	
		stream.write("}");
		stream.end();
});
		}
		})
}); 
	};
	fs.access('./database/blacklist.json', (err) => {
		if (err) {
		var stream = fs.createWriteStream('./database/blacklist.json');
		stream.once('open', (fd) => {
		stream.write("{\n");
		stream.write(`"blacklist": []\n`);
		stream.write("}");
		stream.end();
});
		}
		})
	fs.access('./database/whitelist.json', (err) => {
		if (err) {
		var stream = fs.createWriteStream('./database/whitelist.json');
		stream.once('open', (fd) => {
		stream.write("{\n");
		stream.write(`"whitelist": []\n`);
		stream.write("}");
		stream.end();
});
		}
		})		
function DailyDoppel() {
  const imageFolder = "./images/";

    fs.readdir(imageFolder, (err, doppel_imgs) => {

      if(err) {
        console.log(err)
      }

      let randomIndex = Math.floor(Math.random() * doppel_imgs.length);
      let randomImage = './images/' + doppel_imgs[randomIndex];
      let responses = [
        "You earned a Daily Doppel! Congrats!",
        "What is it?! A Daily Doppel?!",
        "Prepare for trouble! And make it Doppel! No idea what that was, but here's your Doppel image.",
      ];
      const channel = client.channels.cache.get('694943149142966396');
      channel.send(responses[Math.floor(Math.random() * responses.length)], {
        files: [randomImage]
      });
});
}
let job1 = new cron.CronJob('00 00 13 * * *', DailyDoppel);
job1.start();
createConfig();
});

client.on('guildCreate', guild => {
function createConfig() {
		fs.access('./guilds/' + guild.id + '.json', (err) => {
		if (err) {
		var stream = fs.createWriteStream('./guilds/' + guild.id + '.json');
		stream.once('open', (fd) => {
		stream.write("{\n");
		stream.write(`"aa": "inactive",\n`);
		stream.write(`"mentions": "active",\n`);
		stream.write(`"other": "inactive",\n`);
		stream.write(`"prefix": "d!",\n`);
		stream.write(`"filter": "active"\n`);	
		stream.write("}");
		stream.end();
});
		}
		});
		fs.access('./filter/' + guild.id + '.json', (err) => {
		if (err) {
		var stream = fs.createWriteStream('./filter/' + guild.id + '.json');
		stream.once('open', (fd) => {
		stream.write("{\n");
		stream.write(`"banned_words": ["https://discordgift.site/"]\n`);	
		stream.write("}");
		stream.end();
});
		}
		})
	};
createConfig();
});

client.on('guildDelete', guild => {
	fs.unlink('./guilds/' + guild.id + '.json', () => {
	console.log('Removing config...')});
	fs.unlink('./filter/' + guild.id + '.json', () => {
	console.log('Removing filter...')});
});

client.on('message', message => {
	if (!message.guild) return;
	id = message.guild.id;
	const guildconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	const filter = JSON.parse(fs.readFileSync('./filter/' + id + '.json'));
  if (!message.content.startsWith(guildconf.prefix)) {
	  id = message.guild.id;
    if (message.content.toLowerCase().includes("<@!601454973158424585>")) {
	const guildconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	if (guildconf.mentions == "inactive") return;
	if(message.author.bot) return;
      const mention_responses = [
        'My relationship with Arle? Can you handle the knowledge?',
        'I look like Arle? Well of course I do... Haha.',
        'Now...take me to more fun places.',
        'Hahaha... You look surprised. Something wrong?',
        "Ahahaha! I'm having such a great time.",
        "It feels like I've become stronger. I have to thank you.",
        "Defeating me... i'll teach you just what that means!",
        "Hah... what a pointless question... I'm Arle! ...I'm not anything besides that!!",
	      "Today you will definitely acknowledge me... Ahahaha!",
        "No matter how you might want to deny it, the truth remains... that I am what I am...",
        "Is the Arle that you know really Arle, I wonder? Fufufu...",
        "Tell me, are you obligated to prove that you really are yourself? ...Well neither am I.",
        "You get it now, right? There's no need for two Arles...",
      ];
      message.reply(mention_responses[Math.floor(Math.random() * mention_responses.length)]);
    };
	if (filter.banned_words.some(item => message.content.toLowerCase().includes(item))) {
		if(message.author.bot) return;
		if (guildconf.filter == "inactive") return;
		message.delete().catch();
		};
	if(message.content.toLowerCase().startsWith("ahoy")) {
		if(message.author.bot) return;
	const guildconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	if (guildconf.other == "inactive") return;
		message.reply("Ahoy!");
	};
	if(message.content.toLowerCase().startsWith("buttontest")) {
		if(message.author.bot) return;
		let button = new disbut.MessageButton()
  		.setStyle('red') //default: blurple
  		.setLabel('My First Button!') //default: NO_LABEL_PROVIDED
  		.setID('click_to_function') //note: if you use the style "url" you must provide url using .setURL('https://example.com')
		message.reply('Hey, i am powered by https://npmjs.com/discord-buttons', button);
	};
	if(message.content.toLowerCase().includes("realtek")) {
		if(message.author.bot) return;
	const guildconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	if (guildconf.other == "inactive") return;
		const realkek = [
        'Realtek - offering shitty products since 1987!',
        'Did you mean... Realkek?',
        'Realtek - more like Real Pain.',
        'Welcome to the Realtek Mode. Enjoy!',
        "*Message not found. Realtek ate it.*",
        "I'm not happy about Realtek as well.",
        "It took me a lot of effort to read this, y'know.",			
      ];
      message.channel.send(realkek[Math.floor(Math.random() * realkek.length)]);
	};	
	if(message.content.toLowerCase().startsWith("hold it!")) {
	const guildconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	if (guildconf.aa == "inactive") return;
		message.channel.send({
        files: ["./ace_attorney/hold_it.jpg"]
      });
	};
	if(message.content.toLowerCase().startsWith("take that!")) {
	const guildconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	if (guildconf.aa == "inactive") return;
		message.channel.send({
        files: ["./ace_attorney/take_that.jpg"]
      });
	};
	if(message.content.toLowerCase().startsWith("objection!")) {
	const guildconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	if (guildconf.aa == "inactive") return;
		message.channel.send({
        files: ["./ace_attorney/objection.jpg"]
      });
	};
	if(message.content.toLowerCase().startsWith("gotcha!")) {
	const guildconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	if (guildconf.aa == "inactive") return;
		message.channel.send({
        files: ["./ace_attorney/gotcha.jpg"]
      });
	};
	if(message.content.toLowerCase().startsWith("eureka!")) {
	const guildconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	if (guildconf.aa == "inactive") return;
		message.channel.send({
        files: ["./ace_attorney/eureka.png"]
      });
	};	
	if((message.content.toLowerCase().startsWith("thanks")) && (message.channel.id === "694943149142966396")) {
      const welcome = [
        'all conveniences in the world, just for you!',
        "I'm glad you're enjoying this!",
        "you're welcome!",
      ];
      message.reply(welcome[Math.floor(Math.random() * welcome.length)]);
	} else return;
  };

  if(message.author.bot) return;
  if (message.channel.type === 'dm') return;
  

  const args = message.content.slice(guildconf.prefix.length).split(' ');
  const commandName = args.shift().toLowerCase();
  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName); 
  
  if (command.userpermissions) {
	const perms = message.channel.permissionsFor(message.author);
 	if (!perms || !perms.has(command.userpermissions)) {
 		return message.reply('you do not have permission to use this command!');
 	}
}

try {
	command.execute(message, args, client);
} catch (error) {
	console.error(error);
	console.log(error.code);
	if (error.code === Discord.Constants.APIErrors.MISSING_PERMISSIONS) {
		message.reply("I don't have permissions to do that action! Check the Roles page!");
	} else message.reply('there was an error trying to execute that command!');
}

});

client.on('clickButton', async (button) => {
	if (button.id === 'click_to_function') {
	 return button.channel.send(`${button.clicker.user.tag} clicked button!`);
	}
  });

process.on('unhandledRejection', error => {
	console.error('Error:', error);
});

client.login("");