const Discord = require('discord.js');
module.exports = {
	name: 'submit',
  description: 'Submit your content',
	execute(message, args) {

    if(message.channel.type != "dm") return;
    if(message.author.id != "332148103803174913") return;

    if (!args.length) {
        return message.channel.send(`I'm sure you'll find someone to praise one day! :heart:`)
    }
    if (args.length === 1) {
        let user = client.fetchUser(`${args[0]}`)
        .then(user => {
            user.send(`If you are reading this message, your contribution to the DoppelBot was noticed.\nYou can always submit new content by using >submit.\nEverything is accepted, from pictures, to facts and new characters!\nThanks for your help! :smile: :heart:`); 
        });
    }
},
};