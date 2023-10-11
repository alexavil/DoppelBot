const Discord = require("discord.js");
const fs = require("fs-extra");
const sqlite3 = require("better-sqlite3");
const settings = new sqlite3("./data/settings.db");
module.exports = {
  name: "doppel",
  description: "Get a random picture of Doppel",
  execute(message) {
    let event = settings
      .prepare(`SELECT * FROM global WHERE option = 'event_code'`)
      .get().value;
    if (event !== 0) return;
    const imageFolder = "./event/doppelbot_bday/images/";

    fs.readdir(imageFolder, (err, doppel_imgs) => {
      if (err) {
        console.log(err);
      }

      let randomIndex = Math.floor(Math.random() * doppel_imgs.length);
      let randomImage = imageFolder + doppel_imgs[randomIndex];

      const doppelembed = new Discord.EmbedBuilder().setTitle(
        "Here's your Doppel picture!"
      );
      doppelembed.setImage("attachment://" + doppel_imgs[randomIndex]);
      doppelembed.setFooter(
        {text: "If you know the author of this art, please contact us so we can credit them!"}
      );
      message.channel.send({ embeds: [doppelembed], files: [randomImage] });
    });
  },
};
