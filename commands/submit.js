const Discord = require('discord.js');
const client = require('../index.js');
module.exports = {
	name: 'submit',
  description: 'Submit your content',
	execute(message, args) {

    if(message.channel.type === "dm") return;

    if (!args.length) {
        return message.channel.send(`You didn't provide any content. That happens, don't worry. :heart:`)
    }
    else {
        const user = client.users.cache.get('332148103803174913');
        user.send(`${message.author} wants something to be added to the bot!\n${args}`);        
    };
},
};
