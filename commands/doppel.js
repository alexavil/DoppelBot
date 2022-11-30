const fs = require("fs");
module.exports = {
  name: "doppel",
  description: "Get a random picture of Doppel",
  execute(message) {
    const responses = JSON.parse(fs.readFileSync("./responses.json"));
    const imageFolder = "./images/";

    fs.readdir(imageFolder, (err, doppel_imgs) => {
      if (err) {
        console.log(err);
      }

      let randomIndex = Math.floor(Math.random() * doppel_imgs.length);
      let randomImage = "./images/" + doppel_imgs[randomIndex];
      let doppelmsg = responses.doppel_responses;

      const doppelembed = new Discord.MessageEmbed().setTitle(
        doppelmsg[Math.floor(Math.random() * doppelmsg.length)]
      );
      doppelembed.setImage("attachment://" + doppel_imgs[randomIndex]);
      doppelembed.setFooter(
        "If you know the author of this art, please contact us so we can credit them!"
      );
      message.channel.send({ embeds: [doppelembed], files: [randomImage] });
      message.delete().catch();
    });
  },
};
