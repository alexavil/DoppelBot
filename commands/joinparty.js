const Discord = require('discord.js');
const client = new Discord.Client();
module.exports = {
	name: 'joinparty',
  description: 'Join a party',
	 execute(message, args) {
		if (!args.length) {
            return message.channel.send ('Provide a code!');
        }
        if (args.length > 1) {
            return message.channel.send ("You can't join multiple parties!");
        }
        if (args.length === 1) {
            console.log(message.channel.topic);
            code = args[0];
            message.guild.channels.forEach(async channel => {
                if ((channel.type === "category") || (channel.type === "voice") || (channel.topic === null)) return;
                console.log(channel);
                console.log(channel.topic);
                if (channel.topic.startsWith("Party code: " + code)) {
                    channel.send(message.author.tag + ' has joined the party!');
                    message.delete();
                    return channel.overwritePermissions(message.author.id, { VIEW_CHANNEL: true });
                }
            });
            }
        }
	};