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
            \`/queue\` - view the current queue`,
        },
        {
          name: "Tags",
          value: `Certain servers may use key phrases and give out a response! You can view all the tags with \`/tags\`.`,
        },
      );
    interaction.editReply({ embeds: [help] });
  },
};
