const Discord = require('discord.js');
const client = new Discord.Client();
module.exports = {
	name: 'endparty',
  description: 'End a party',
	 execute(message) {
    if ((message.channel.topic === null) || (!message.channel.name.startsWith("party-"))) {
      message.delete();
      return message.channel.send('This is not a valid party.')
    } 
     var topic = message.channel.topic;
     user = topic.substr(26);
     console.log(user);
     if((message.channel.topic.endsWith("Leader: " + user)) && user == message.author.tag) {
            if (message.channel.name.startsWith("party-")) {
                return message.channel.delete();
                }
            } else {
            message.delete();
            return message.channel.send('You are not the leader of this party or this is not a valid party.')
            }
          },
	};