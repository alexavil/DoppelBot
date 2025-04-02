import Discord from "discord.js";
const debug = process.env.DEBUG;
const { default: music } = await import("../../../utils/music.js");

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
      let message;
      switch (msg) {
        case -1: {
          message = "This file already exists in the cache!";
          break;
        }
        case 0: {
          message = "File uploaded successfully!";
          break;
        }
        case 1: {
          message = "There was an error uploading your file!";
          break;
        }
      }
      return interaction.editReply({
        content: message,
        flags: Discord.MessageFlags.Ephemeral,
      });
    }
  },
};
