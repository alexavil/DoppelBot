const Discord = require("discord.js");
const debug = require("../index");
const sqlite3 = require("better-sqlite3");

const masterqueue = new sqlite3("./data/queue.db");
module.exports = {
  name: "queue",
  description: "Get the server queue",
  async execute(message) {
    const id = message.guild.id;
    if (debug.debug === true)
      console.log("[DEBUG] Requesting queue for " + id + "...");
    let embed = new Discord.EmbedBuilder();
    let queuelength = masterqueue
      .prepare(`SELECT * FROM guild_${id}`)
      .all().length;
    if (queuelength !== 0) {
      masterqueue
        .prepare(`SELECT * FROM guild_${id}`)
        .all()
        .forEach((track) => {
          embed.addFields({
            name: track.track,
            value: `Requested by: <@!${track.author}>`,
            inline: true,
          });
        });
    } else {
      embed.setDescription("The queue is empty!");
    }
    embed.setTitle("Queue");
    embed.setColor("#0099ff");
    return message.channel.send({ embeds: [embed] });
  },
};
