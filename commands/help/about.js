import Discord from "discord.js";
const name = process.env.NAME;
export default {
	data: new Discord.SlashCommandBuilder()
		.setName('about')
		.setDescription('Get all commands'),
  async execute(interaction) {
    const help = new Discord.EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`${name} Help`)
      .addFields(
        {
          name: "Music commands",
          value: `\`/play\` - play music
          \`/suggest\` - suggest search queries for a string
            \`/search\` - search for music
            \`/pause\` - pause the current track
            \`/stop\` - stop playing
            \`/queue\` - view the current queue
            \`/skip\` - skip the current track
            \`/loop\` - loop the current track
            \`/seek\` - view the current position of a song`,
        },
        {
          name: "Tags",
          value: `Certain servers may use key phrases and give out a response! You can view all the tags with \`/tags\`.`,
        },
      );
    interaction.reply({ embeds: [help] });
  },
};
