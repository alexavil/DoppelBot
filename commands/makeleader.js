const Discord = require('discord.js');
const client = new Discord.Client();
module.exports = {
	name: 'makeleader',
  description: 'Make someone a leader',
	 execute(message, args) {
    if ((message.channel.topic === null) || (!message.channel.name.startsWith("party-"))) {
      message.delete();
      return message.channel.send('This is not a valid party.')
    } 
     var topic = message.channel.topic;
     user = topic.substr(26);
	 code = topic.substr(0, 26);
     console.log(user);
     if((message.channel.topic.endsWith("Leader: " + user)) && user == message.author.tag) {
            if (message.channel.name.startsWith("party-")) {
                if(!args.length) {
					message.delete();
					return message.channel.send('Mention the new leader!');
				}
				if(args.length > 1) {
					message.delete();
					return message.channel.send("There can't be multiple leaders!");
				}
				if(args.length == 1) {
					const newleader = message.mentions.users.first();
						message.channel.overwritePermissions(message.author.id, { MANAGE_MESSAGES: false });
						message.channel.overwritePermissions(newleader.id, { MANAGE_MESSAGES: true });
						message.channel.setTopic(code + newleader.tag);
						message.delete();
						return message.channel.send("Done!");
				};
                }
            } else {
            message.delete();
            return message.channel.send('You are not the leader of this party or this is not a valid party.')
            }
          },
	};