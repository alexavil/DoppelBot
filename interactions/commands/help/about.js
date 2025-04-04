import Discord from "discord.js";
const name = process.env.NAME;
export default {
  data: new Discord.SlashCommandBuilder()
    .setName("about")
    .setDescription("Get all commands"),
  async execute(interaction) {
    const help = new Discord.EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`${name} Help`)
      .setDescription("Check out our blog at https://doppelbot.jsbox.xyz/")
      .addFields(
        {
          name: "Music commands",
          value: `\`/play\` - play music from a local file (online functionality will be restored later)
            \`/upload\` - upload a track to the music library
            \`/queue\` - view the current queue
            \`/controls\` - bring up the music player controls`,
        },
        {
          name: "Tags",
          value: `Certain servers may use key phrases and give out a response! You can view all the tags with \`/tags\`.`,
        },
      );
    interaction.editReply({ embeds: [help] });
  },
};
