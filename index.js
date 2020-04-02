const fs = require('fs');
const Discord = require('discord.js');
const { Client, RichEmbed, Permissions, PermissionOverwrites, GuildMember, } = require('discord.js');
const config = require('./config.json')

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
    game: {
        name: `with Doppel`,
        type: "PLAYING"
    },
});
});

client.on('message', message => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).split(' ');
  const commandName = args.shift().toLowerCase();
  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);

try {
	command.execute(message, args);
} catch (error) {
	console.error(error);
	message.reply('there was an error trying to execute that command!');
}

if (message.isMentioned(client.user)) {
  mention_responses = [
    "My relationship with Arle? Can you handle the knowledge?",
    "I look like Arle? Well of course I do... Haha.",
    "Now...take me to more fun places.",
    "Hahaha... You look surprised. Something wrong?",
    "Ahahaha! I'm having such a great time.",
    "It feels like I've become stronger. I have to thank you.",
    "Defeating me... i'll teach you just what that means!",
    "Hah... what a pointless question... I'm Arle! ...I'm not anything besides that!!",
  ]
  message.reply(mention_responses[Math.floor(Math.random() * mention_responses.length)]);
}
});

client.login(process.env.bot_token);
