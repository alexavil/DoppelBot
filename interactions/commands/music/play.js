import Discord, { ButtonStyle } from "discord.js";
const debug = process.env.DEBUG;
const { default: music } = await import("../../../utils/music.js");

import fs from "fs-extra";

import path from "path";

import sqlite3 from "better-sqlite3";

const cache = new sqlite3("./data/cache.db");

import { dirname } from "path";
import { fileURLToPath } from "url";
import { generateMenu } from "../../../utils/CacheMenuGenerator.js";

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
              music.announceTrack(
                track.name,
                interaction.member.id,
                interaction,
              );
            }
            return interaction.editReply({
              content: "Added to the queue!",
              flags: Discord.MessageFlags.Ephemeral,
            });
          }
          case 1: {
            return interaction.editReply({
              content: "There was an error uploading your file!",
              flags: Discord.MessageFlags.Ephemeral,
            });
          }
        }
      }
    } else {
      let options = cache.prepare("SELECT * FROM files_directory").all();
      if (options.length === 0)
        return interaction.editReply({
          content: `There are no tracks in the cache. Please upload a new track using \`/upload\`.`,
          flags: Discord.MessageFlags.Ephemeral,
        });
      let reply = generateMenu(options, 1);
      music.menu_pages.set(id, 1);
      return interaction.editReply(reply);
    }
  },
};
