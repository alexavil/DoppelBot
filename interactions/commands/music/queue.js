import engine from "../../../utils/Engine.js";
import sqlite3 from "better-sqlite3";
import Discord from "discord.js";

const queue = new sqlite3("./data/queue.db");
export default {
  data: new Discord.SlashCommandBuilder()
    .setName("queue")
    .setDescription("View current queue"),
  async execute(interaction) {
    const id = interaction.guild.id;
    let counter = 0;
    let embed = new Discord.EmbedBuilder();
    let queuelength = queue.prepare(`SELECT * FROM guild_${id}`).all().length;
    if (queuelength !== 0) {
      engine.debugLog(`Queue for ${id} is not empty, fetching tracks...`);
      queue
        .prepare(`SELECT * FROM guild_${id}`)
        .all()
        .forEach((track) => {
          if (counter < 25) {
            embed.addFields({
              name: `\`${track.name}\``,
              value: `Requested by: <@!${track.author}>`,
              inline: true,
            });
            counter++;
          }
        });
    } else {
      engine.debugLog(`Queue for ${id} is empty...`);
      embed.setDescription("The queue is currently empty.");
    }
    embed.setTitle(`Queue for ${interaction.guild.name}`);
    embed.setColor("#0099ff");
    return interaction.editReply({ embeds: [embed] });
  },
};
