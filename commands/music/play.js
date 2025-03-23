import Discord, { ButtonStyle } from "discord.js";
const debug = process.env.DEBUG;
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  getVoiceConnection,
  AudioPlayerStatus,
} from "@discordjs/voice";
import sqlite3 from "better-sqlite3";
const settings = new sqlite3("./data/settings.db");
const { default: music } = await import("../../utils/music.js");

export default {
  data: new Discord.SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a track")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("local")
        .setDescription("Play local file")
        .addAttachmentOption((option) =>
          option
            .setName("track")
            .setDescription("File to play")
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("online")
        .setDescription("Play an online track")
        .addStringOption((option) =>
          option
            .setName("track")
            .setDescription("Video link")
            .setRequired(true),
        ),
    ),
  async execute(interaction) {
    const id = interaction.guild.id;
    switch (interaction.options.getSubcommand()) {
      case "local": {
        if (!interaction.member.voice.channel) {
          if (debug === "true")
            console.log("[DEBUG] No voice channel found, aborting...");
          return interaction.editReply(
            "You need to join a voice channel first!",
          );
        }
        let track = interaction.options.getAttachment("track");
        let connection = music.getConnection(interaction);
        music.addToQueue(
          interaction.guild.id,
          track.url,
          track.name,
          interaction.member.id,
        );
        await music.getLocalFile(track);
        music.announceTrack(track.name, interaction.member.id, interaction);
        return interaction.editReply({
          content: "Success!",
          flags: Discord.MessageFlags.Ephemeral,
        });
      }
      case "online": {
        return interaction.editReply({
          content: "Online files are currently unavailable.",
          flags: Discord.MessageFlags.Ephemeral,
        });
      }
    }
  },
};
