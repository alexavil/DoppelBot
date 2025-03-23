import Discord, { messageLink } from "discord.js";
const debug = process.env.DEBUG;
const { default: music } = await import("../../utils/music.js");

const allowedExts = [".flac", ".mp3", ".ogg", ".wav", ".m4a"];

export default {
  data: new Discord.SlashCommandBuilder()
    .setName("upload")
    .setDescription("Upload a track to the cache")
    .addAttachmentOption((option) =>
      option
        .setName("track")
        .setDescription("File to upload")
        .setRequired(true),
    ),
  async execute(interaction) {
    let track = interaction.options.getAttachment("track");
    if (!allowedExts.some((extension) => track.name.endsWith(extension))) {
      return interaction.editReply({
        content: "This file has an invalid file extension.",
        flags: Discord.MessageFlags.Ephemeral,
      });
    } else {
      let msg = await music.getLocalFile(track);
      return interaction.editReply({
        content: msg,
        flags: Discord.MessageFlags.Ephemeral,
      });
    }
  },
};
