import Discord from "discord.js";
import sqlite3 from "better-sqlite3";
const name = process.env.NAME;
export default {
  name: "about",
  aliases: ["help"],
  description: "About the bot",
  execute(message) {
    const settings = new sqlite3("./data/settings.db");
    let id = message.guild.id;
    let prefix = settings
      .prepare(`SELECT value FROM guild_${id} WHERE option = 'prefix'`)
      .get().value;
    const help = new Discord.EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`${name} Help`)
      .addFields(
        {
          name: "Music commands",
          value: `\`${prefix}play\` - play music
          \`${prefix}suggest\` - suggest search queries for a string
            \`${prefix}search\` - search for music
            \`${prefix}pause\` - pause the current track
            \`${prefix}stop\` - stop playing
            \`${prefix}queue\` - view the current queue
            \`${prefix}skip\` - skip the current track
            \`${prefix}loop\` - loop the current track
            \`${prefix}seek\` - view the current position of a song`,
        },
        {
          name: "Tags",
          value: `Certain servers may use key phrases and give out a response! You can view all the tags with \`${prefix}listtags\`.`,
        },
      );
    message.channel.send({ embeds: [help] });
  },
};
