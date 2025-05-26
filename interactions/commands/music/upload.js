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
    )
    .addStringOption((option) =>
      option
        .setName("display_name")
        .setDescription("Display name for the track"),
    ),
  async execute(interaction) {
    let track = interaction.options.getAttachment("track");
    if (!allowedExts.some((extension) => track.name.endsWith(extension))) {
      return interaction.editReply({
        content: "This file has an invalid file extension.",
        flags: Discord.MessageFlags.Ephemeral,
      });
    } else {
      if (debug === "true") console.log(`Adding track(s) to the cache...`);
      let name = interaction.options.getString("display_name");
      let status;
      if (name !== undefined) status = await music.getLocalFile(track, name);
      else status = await music.getLocalFile(track, track.name);
      let message;
      switch (status) {
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
