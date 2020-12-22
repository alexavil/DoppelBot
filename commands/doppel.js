const Discord = require('discord.js');
const fs = require('fs');
module.exports = {
	name: 'doppel',
  description: 'Get a random picture of Doppel',
	execute(message) {

    const imageFolder = "./images/";

    fs.readdir(imageFolder, (err, doppel_imgs) => {

      if(err) {
        console.log(err)
      }

      let randomIndex = Math.floor(Math.random() * doppel_imgs.length);
      let randomImage = './images/' + doppel_imgs[randomIndex];
      let responses = [
        "Here's your Doppel picture!",
        "Doppel's cute, isn't she? :heart:",
        "I hope you're having a great time! :wink: Here's a Doppel picture for you!",
      ];

      message.channel.send(responses[Math.floor(Math.random() * responses.length)], {
        file: randomImage
      });
          message.delete().catch();
  });

   
},
};
