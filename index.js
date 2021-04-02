const fs = require('fs');
const Discord = require('discord.js');
const cron = require("cron");
const { Client, MessageEmbed, Permissions, PermissionOverwrites, GuildMember, } = require('discord.js');
const config = require('./config.json');

const client = new Discord.Client();
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
        name: `Who's Your Doppel?!`,
    },
});
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
      const channel = client.channels.get('694943149142966396');
      channel.send(responses[Math.floor(Math.random() * responses.length)], {
        files: [randomImage]
      });
});
}
let job1 = new cron.CronJob('00 00 13 * * *', DailyDoppel);
job1.start();
});

client.on('message', message => {
  if (!message.content.startsWith(config.prefix)) {
    if (message.mentions.has(client.user)) {
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
	if((message.content.toLowerCase().includes("https://discordgift.site/"))) {
		message.delete();
	};	
	if(message.content.toLowerCase().startsWith("ahoy")) {
		message.reply("Ahoy!");
	};
	if(message.content.toLowerCase().startsWith("hold it!")) {
		message.channel.send({
        files: ["./ace_attorney/hold_it.jpg"]
      });
	};
	if(message.content.toLowerCase().startsWith("take that!")) {
		message.channel.send({
        files: ["./ace_attorney/take_that.jpg"]
      });
	};
	if(message.content.toLowerCase().startsWith("objection!")) {
		message.channel.send({
        files: ["./ace_attorney/objection.jpg"]
      });
	};
	if(message.content.toLowerCase().startsWith("gotcha!")) {
		message.channel.send({
        files: ["./ace_attorney/gotcha.jpg"]
      });
	};
	if(message.content.toLowerCase().startsWith("Eureka!")) {
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
	};
if((message.content.startsWith("play ina unravel")) ||(message.content.startsWith("doppelbot, play ina unravel")) || (message.content.startsWith("this is so sad, doppelbot play ina unravel"))) {
  if(message.author.bot) return;
message.channel.send('https://www.youtube.com/watch?v=n-hRYCpm8wQ');
} else return;
  };

  if(message.author.bot) return;

  const args = message.content.slice(config.prefix.length).split(' ');
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
	command.execute(message, args);
} catch (error) {
	console.error(error);
	console.log(error.code);
	if (error.code === Discord.Constants.APIErrors.MISSING_PERMISSIONS) {
		message.reply("I don't have permissions to do that action! Check the Roles page!");
	} else message.reply('there was an error trying to execute that command!');
}

});

process.on('unhandledRejection', error => {
	console.error('Error:', error);
});

client.login();