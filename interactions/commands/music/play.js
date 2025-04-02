import Discord, { ButtonStyle } from "discord.js";
const debug = process.env.DEBUG;
const { default: music } = await import("../../../utils/music.js");

import fs from "fs-extra";

import path from "path";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cacheFolder = "../../../cache/";

const allowedExts = [".flac", ".mp3", ".ogg", ".wav", ".m4a"];

export default {
  data: new Discord.SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a track")
    .addAttachmentOption((option) =>
      option.setName("track").setDescription("File to play"),
    ),
  async execute(interaction) {
    const id = interaction.guild.id;
    if (!interaction.member.voice.channel) {
      if (debug === "true")
        console.log("[DEBUG] No voice channel found, aborting...");
      return interaction.editReply("You need to join a voice channel first!");
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
            music.addToQueue(
              interaction.guild.id,
              track.url,
              track.name,
              interaction.member.id,
            );
            let length = music.getQueueLength(id);
            if (length === 1) {
              music.playLocalFile(track.name, connection, interaction);
              music.announceTrack(track.name, interaction.member.id, interaction);
            }
            return interaction.editReply({
              content: "Added to the queue!",
              flags: Discord.MessageFlags.Ephemeral,
            });
          }
          case 1: {
            message = "There was an error uploading your file!";
            break;
          }
        }
      }
    } else {
      let values = [];
      let options = await fs.readdir(path.join(__dirname, cacheFolder));
      if (options.length === 0)
        return interaction.editReply({
          content: `There are no tracks in the cache. Please upload a new track using \`/upload\`.`,
          flags: Discord.MessageFlags.Ephemeral,
        });
      options.forEach((option) => {
        let menuOption = new Discord.StringSelectMenuOptionBuilder()
          .setLabel(option)
          .setValue(option);
        values.push(menuOption);
      });
      const menu = new Discord.StringSelectMenuBuilder()
        .setCustomId(`selectlocal`)
        .setOptions(values)
        .setMinValues(1)
        .setMaxValues(values.length);
      const cancel = new Discord.ButtonBuilder()
        .setCustomId(`music_cancel`)
        .setLabel(`Cancel`)
        .setStyle(ButtonStyle.Primary);
      const row = new Discord.ActionRowBuilder().addComponents(menu);
      const row2 = new Discord.ActionRowBuilder().addComponents(cancel);
      return interaction.editReply({
        content: `Select track(s) to play.`,
        components: [row, row2],
        flags: Discord.MessageFlags.Ephemeral,
      });
    }
  },
};
