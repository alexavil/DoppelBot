const Discord = require('discord.js');
const client = new Discord.Client();
module.exports = {
	name: 'leaveparty',
  description: 'Leave a party',
	 execute(message) {
    if ((message.channel.topic === null) || (!message.channel.name.startsWith("party-"))) {
      message.delete();
      return message.channel.send('This is not a valid party.')
    } 
    var topic = message.channel.topic;
    user = topic.substr(26);
    console.log(user);
    if((message.channel.topic.endsWith("Leader: " + user)) && user != message.author.tag) {   
                message.channel.send(message.author.tag + ' has left the party!');
                message.delete();
                return message.channel.overwritePermissions(message.author.id, { VIEW_CHANNEL: false });
              } else {
              message.delete();
              return message.channel.send('You cannot leave your own party. Use d!endparty to leave it.')
              }
            },
	};