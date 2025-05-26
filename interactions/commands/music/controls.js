import Discord from "discord.js";
const debug = process.env.DEBUG;
const { default: music } = await import("../../../utils/music.js");

export default {
  data: new Discord.SlashCommandBuilder()
    .setName("controls")
    .setDescription("Display player controls (VC only)"),
  async execute(interaction) {
    if (!interaction.member.voice.channel) {
      if (debug === "true")
        console.log("No voice channel found, aborting...");
      return interaction.editReply("You need to join a voice channel first!");
    }
    if (music.getQueueLength(interaction.guild.id) === 0) {
      if (debug === "true")
        console.log("No tracks are playing, aborting...");
      return interaction.editReply(
        "The queue is empty, add tracks to use the player controls!",
      );
    }
    const loop = new Discord.ButtonBuilder()
      .setCustomId(`loop`)
      .setEmoji("🔄")
      .setStyle(Discord.ButtonStyle.Primary);
    const pause = new Discord.ButtonBuilder()
      .setCustomId(`pause`)
      .setEmoji("⏸")
      .setStyle(Discord.ButtonStyle.Primary);
    const skip = new Discord.ButtonBuilder()
      .setCustomId(`skip`)
      .setEmoji("⏩")
      .setStyle(Discord.ButtonStyle.Primary);
    const stop = new Discord.ButtonBuilder()
      .setCustomId(`stop`)
      .setEmoji("⏹")
      .setStyle(Discord.ButtonStyle.Danger);
    const seek = new Discord.ButtonBuilder()
      .setCustomId(`seek`)
      .setEmoji("🔎")
      .setStyle(Discord.ButtonStyle.Primary);
    const row = new Discord.ActionRowBuilder().addComponents(
      loop,
      pause,
      stop,
      skip,
      seek,
    );
    if (music.getQueueLength(interaction.guild.id) === 1) {
      skip.setDisabled(true);
    }
    return interaction.editReply({
      content: "Use these buttons to control the playback.",
      components: [row],
      flags: Discord.MessageFlags.Ephemeral,
    });
  },
};
