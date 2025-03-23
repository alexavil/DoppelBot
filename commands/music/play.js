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

const allowedExts = [".flac", ".mp3", ".ogg", ".wav", ".m4a"];

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
            .setDescription("File to play"),
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
        if (track) {
              if (!allowedExts.some((extension) => track.name.endsWith(extension))) {
                return interaction.editReply({
                  content: "This file has an invalid file extension.",
                  flags: Discord.MessageFlags.Ephemeral,
                });
              } else {
                let msg = await music.getLocalFile(track);
                switch (msg) {
                  case -1:
                  case 0: {
                      music.addToQueue(interaction.guild.id, track.url, track.name, interaction.member.id);
                      music.playLocalFile(track.name, connection);
                      music.announceTrack(track.name, interaction.member.id, interaction);
                      return interaction.editReply({
                        content: "Success!",
                        flags: Discord.MessageFlags.Ephemeral,
                      });
                  }
                  case 1: {
                      message = "There was an error uploading your file!";
                      break;
                  }
                }
              }
        }
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
