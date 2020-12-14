const Discord = require('discord.js');
const fs = require('fs');
const index = require('./index.js');
module.exports = {
	name: 'doppel',
  description: 'Get a random picture of Doppel',
	execute(message) {
		
		message.delete().catch();

    function randomInt(min, max) {
      return min + Math.floor((max - min) * Math.random());
    }

    chance = randomInt(1, 100);

    const responses = [
      "Here's your Doppel picture!",
      "Doppel's cute, isn't she? :heart:",
      "I hope you're having a great time! :wink: Here's a Doppel picture for you!",
    ];
	imagescan();
	
   
if (chance == 58) {
  message.channel.send("Here's your... wait, this isn't Doppel... Could anything ELSE go wrong today?!?!", {
    file: "./images/mq2.png"
  });
}
if (chance == 27) {
  message.channel.send("Here's your... wait, this isn't Doppel... it's Boreas! At this time of year, at this time of day, in this part of the country, localized entirely within this channel?!", {
    file: "./images/borealis.png"
  });
}
if ((chance != 58) && (chance != 27)) {
message.channel.send(responses[Math.floor(Math.random() * responses.length)], {
  file: doppel_imgs[Math.floor(Math.random() * doppel_imgs.length)]
});
}
	},
};
