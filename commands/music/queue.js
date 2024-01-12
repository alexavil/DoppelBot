import Discord from "discord.js";
const debug = process.env.DEBUG;
import sqlite3 from "better-sqlite3";

const masterqueue = new sqlite3("./data/queue.db");
export default {
  data: new Discord.SlashCommandBuilder()
    .setName("queue")
    .setDescription("View current queue"),
  async execute(interaction) {
    const id = interaction.guild.id;
    let counter = 0;
    let embed = new Discord.EmbedBuilder();
    let queuelength = masterqueue
      .prepare(`SELECT * FROM guild_${id}`)
      .all().length;
    if (queuelength !== 0) {
      if (debug === "true")
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
      if (debug === "true") console.log(`[DEBUG] Queue for ${id} is empty...`);
      embed.setDescription("The queue is empty!");
    }
    embed.setTitle("Queue");
    embed.setColor("#0099ff");
    return interaction.reply({ embeds: [embed] });
  },
};
