const fs = require('fs');
const Discord = require('discord.js');
const cron = require("cron");
const { Client, MessageEmbed, Permissions, PermissionOverwrites, GuildMember, MessageAttachment, Intents } = require('discord.js');

const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_TYPING] });
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const responses = JSON.parse(fs.readFileSync('./responses.json'));

client.on('ready', () => {
  console.log('I am ready!');
function gamecycle() {
	var games = ["Formula Doppel","Doppel Doppel Literature Club Plus","LEGO Puyo Puyo: The Video Game","Doppel Adventure DX","Doppelganger Arle: Ace Attorney","Super Arle Sisters","Microsoft Doppel Simulator X: Arle Edition","doppel&box","Hearts of Arle IV","Doppel's Mod","Doppel's Schoolhouse (Featuring Sonic The Hedgehog)"]
	var gamestring = Math.floor(Math.random() * games.length);
	client.user.setActivity(games[gamestring]);
}	
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
		stream.write(`"filter": "active",\n`);
		stream.write(`"global_bans": "active"\n`);		
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
		fs.access('./filter/scamlist.json', (err) => {
		if (err) {
		var stream = fs.createWriteStream('./filter/scamlist.json');
		stream.once('open', (fd) => {
		stream.write("{\n");
		stream.write(`"banned_links": ["https://discordgift.site/"]\n`);	
		stream.write("}");
		stream.end();
});
		}
		})		
}); 
	};	
function DailyDoppel() {
  const imageFolder = "./images/";

    fs.readdir(imageFolder, (err, doppel_imgs) => {

      if(err) {
        console.log(err)
      }

      let randomIndex = Math.floor(Math.random() * doppel_imgs.length);
      let randomImage = './images/' + doppel_imgs[randomIndex];
      let ddmessage = responses.dd_responses;
      const channel = client.channels.cache.get('694943149142966396');
	  const doppelembed = new Discord.MessageEmbed()
		.setTitle(ddmessage[Math.floor(Math.random() * ddmessage.length)])
		const file = new MessageAttachment(randomImage);
		doppelembed.setImage('attachment://' + doppel_imgs[randomIndex]);
		channel.send({embeds: [doppelembed], files: [randomImage] });
});
}
let job1 = new cron.CronJob('00 00 13 * * *', DailyDoppel);
job1.start();
let job2 = new cron.CronJob('00 00 * * * *', gamecycle);
job2.start();
createConfig();
gamecycle();
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
		stream.write(`"filter": "active",\n`);
		stream.write(`"global_bans": "active"\n`);		
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

client.on('messageCreate', message => {
	if (!message.guild) return;
	id = message.guild.id;
	const guildconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	const filter = JSON.parse(fs.readFileSync('./filter/' + id + '.json'));
	const scamfilter = JSON.parse(fs.readFileSync('./filter/scamlist.json'));
  if (!message.content.startsWith(guildconf.prefix)) {
	  id = message.guild.id;
    if (message.content.toLowerCase().includes("<@!601454973158424585>")) {
	const guildconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	if (guildconf.mentions == "inactive") return;
	if(message.author.bot) return;
      const mention_responses = responses.mention_responses;
      message.reply(mention_responses[Math.floor(Math.random() * mention_responses.length)]);
    };
	if (filter.banned_words.some(item => message.content.toLowerCase().includes(item))) {
		if(message.author.bot) return;
		if (guildconf.filter == "inactive") return;
		message.delete().catch();
		};
	if (scamfilter.banned_links.some(item => message.content.toLowerCase().includes(item))) {
		if(message.author.bot) return;
		message.delete().catch();
		message.guild.members.ban(message.author, {reason: "Scammer"});
		};		
	if(message.content.toLowerCase().startsWith("ahoy")) {
		if(message.author.bot) return;
	const guildconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	if (guildconf.other == "inactive") return;
		message.reply("Ahoy!");
	};
	if(message.content.toLowerCase().includes("realtek")) {
		if(message.author.bot) return;
	const guildconf = JSON.parse(fs.readFileSync('./guilds/' + id + '.json'));
	if (guildconf.other == "inactive") return;
		const realtek_responses = responses.realkek;
      message.channel.send(realtek_responses[Math.floor(Math.random() * realtek_responses.length)]);
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
      message.reply(responses.thanks[Math.floor(Math.random() * responses.thanks.length)]);
	} else return;
  };

  if(message.author.bot) return;
  if (message.channel.type === 'dm') return;
  

  const args = message.content.slice(guildconf.prefix.length).split(' ');
  const commandName = args.shift().toLowerCase();
	const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;
  
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
