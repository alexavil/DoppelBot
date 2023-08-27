const Discord = require("discord.js");
const debug = require("../index");
const sqlite3 = require("better-sqlite3");

const masterqueue = new sqlite3("./data/queue.db");
const settings = new sqlite3("./data/settings.db");
module.exports = {
  name: "queue",
  description: "Get the server queue",
  aliases: ["q"],
  async execute(message) {
    const id = message.guild.id;
    if (
      settings
        .prepare(`SELECT * FROM guild_${id} WHERE option = ?`)
        .get("music_mode").value === "radio"
    )
      return message.reply(
        "You can't use this command while tuned to 85.2 FM!",
      );
    let counter = 0;
    let embed = new Discord.EmbedBuilder();
    let queuelength = masterqueue
      .prepare(`SELECT * FROM guild_${id}`)
      .all().length;
    if (queuelength !== 0) {
      if (debug.debug === true)
        console.log(`[DEBUG] Queue for ${id} is not empty, fetching tracks...`);
      masterqueue
        .prepare(`SELECT * FROM guild_${id}`)
        .all()
        .forEach((track) => {
          if (counter < 25) {
            embed.addFields({
              name: track.track,
              value: `Requested by: <@!${track.author}>`,
              inline: true,
            });
            counter++;
          }
        });
    } else {
      if (debug.debug === true)
        console.log(`[DEBUG] Queue for ${id} is empty...`);
      embed.setDescription("The queue is empty!");
    }
    embed.setTitle("Queue");
    embed.setColor("#0099ff");
    return message.channel.send({ embeds: [embed] });
  },
};
