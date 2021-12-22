const fs = require('fs');
const Discord = require('discord.js');
const cron = require("cron");
const { Client, MessageEmbed, Permissions, PermissionOverwrites, GuildMember, MessageAttachment, Intents } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_TYPING] });
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const responses = JSON.parse(fs.readFileSync('./responses.json'));


let settings = new sqlite3.Database('./guilds.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the settings database.');
    settings.run('CREATE TABLE IF NOT EXISTS guilds(id text, aa text, mentions text, other text, prefix text, filter text)');
  });

client.on('ready', () => {
  console.log('I am ready!');
function gamecycle() {
	var games = ["Doppel Doppel Literature Club Plus","LEGO Puyo Puyo: The Video Game","Doppel Adventure DX","Doppelganger Arle: Ace Attorney","Super Arle Sisters","Microsoft Doppel Simulator X: Arle Edition","doppel&box","Hearts of Arle IV","Doppel's Mod","Doppel's Schoolhouse (Featuring Sonic The Hedgehog)"]
	var gamestring = Math.floor(Math.random() * games.length);
	console.log(gamestring);
	client.user.setActivity(games[gamestring]);
}	
function createConfig() {
	client.guilds.cache.forEach(g => {
		settings.all('SELECT * FROM guilds WHERE id=?', [g.id], (err, rows) => {
			if (err) {
				throw err;
			}
			if (!rows[0]) {
				settings.run(`INSERT INTO guilds(id, aa, mentions, other, prefix, filter) VALUES(?, ?, ?, ?, ?, ?)`, [`${g.id}`, `no`, `yes`, `no`, `d!`, `yes`], function (err) {
					if (err) {
						return console.log(err.message);
					}
					console.log(`A new guild has been added! ${g.id}`);
				});
            }
		});
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
	settings.run(`INSERT INTO guilds(id, aa, mentions, other, prefix, filter) VALUES(?, ?, ?, ?, ?, ?)`, [`${guild.id}`, `no`, `yes`, `no`, `d!`, `yes`], function(err) {
		if (err) {
		  return console.log(err.message);
		}
		console.log(`A new guild has been added! ${guild.id}`);
	  });
	};
createConfig();
});

client.on('guildDelete', guild => {
	settings.run(`DELETE FROM guilds WHERE id=?`, guild.id, function(err) {
		if (err) {
		  return console.error(err.message);
		}
		console.log(`Guild deleted: ${guild.id}`);
		});
});

client.on('messageCreate', message => {
	if (!message.guild) return;
	id = message.guild.id;
	settings.all('SELECT * FROM guilds WHERE id=?', [id], (err, rows) => {
		if (err) {
			throw err;
		}
		rows.forEach((row) => {
			console.log(row.prefix);
			if (!message.content.startsWith(row.prefix)) {
				if (message.content.toLowerCase().includes("<@!601454973158424585>")) {
					if (row.mentions == "no") return;
					if (message.author.bot) return;
					const mention_responses = responses.mention_responses;
					message.reply(mention_responses[Math.floor(Math.random() * mention_responses.length)]);
				};
				if (message.content.toLowerCase().startsWith("ahoy")) {
					if (message.author.bot) return;
					if (row.other == "no") return;
					message.reply("Ahoy!");
				};
				if (message.content.toLowerCase().includes("realtek")) {
					if (message.author.bot) return;					
					if (row.other == "no") return;
					const realtek_responses = responses.realkek;
					message.channel.send(realtek_responses[Math.floor(Math.random() * realtek_responses.length)]);
				};
				if (message.content.toLowerCase().startsWith("hold it!")) {					
					if (row.aa == "no") return;
					message.channel.send({
						files: ["./ace_attorney/hold_it.jpg"]
					});
				};
				if (message.content.toLowerCase().startsWith("take that!")) {					
					if (row.aa == "no") return;
					message.channel.send({
						files: ["./ace_attorney/take_that.jpg"]
					});
				};
				if (message.content.toLowerCase().startsWith("objection!")) {					
					if (row.aa == "no") return;
					message.channel.send({
						files: ["./ace_attorney/objection.jpg"]
					});
				};
				if (message.content.toLowerCase().startsWith("gotcha!")) {					
					if (row.aa == "no") return;
					message.channel.send({
						files: ["./ace_attorney/gotcha.jpg"]
					});
				};
				if (message.content.toLowerCase().startsWith("eureka!")) {					
					if (row.aa == "no") return;
					message.channel.send({
						files: ["./ace_attorney/eureka.png"]
					});
				};
				if ((message.content.toLowerCase().startsWith("thanks")) && (message.channel.id === "694943149142966396")) {
					const welcome = [
						'All conveniences in the world, just for you!',
						"I'm glad you're enjoying this!",
						"You're welcome!",
					];
					message.reply(welcome[Math.floor(Math.random() * welcome.length)]);
				} else return;
			};

			const args = message.content.slice(row.prefix.length).split(' ');
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
	});

  if(message.author.bot) return;
  if (message.channel.type === 'dm') return;
  
});


process.on('unhandledRejection', error => {
	console.error('Error:', error);
});

client.login("");
