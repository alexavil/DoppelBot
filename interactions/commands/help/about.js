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
    const privacy = new Discord.ButtonBuilder()
      .setLabel(`Privacy Policy`)
      .setURL("https://doppelbot.jsbox.xyz/privacy-policy/")
      .setStyle(Discord.ButtonStyle.Link);
    const update = new Discord.ButtonBuilder()
      .setLabel(`Update History`)
      .setURL("https://doppelbot.jsbox.xyz/update-history/")
      .setStyle(Discord.ButtonStyle.Link);
    const blog = new Discord.ButtonBuilder()
      .setLabel(`Website`)
      .setURL("https://doppelbot.jsbox.xyz/")
      .setStyle(Discord.ButtonStyle.Link);
    const row = new Discord.ActionRowBuilder().addComponents(privacy, update, blog);
    interaction.editReply({ embeds: [help], components: [row] });
  },
};
