import engine from "../../../utils/Engine.js";
import Discord, { ButtonStyle } from "discord.js";

import musicEngine from "../../../utils/music.js";
const { default: service } = await import("../../../utils/Engine.js");

import sqlite3 from "better-sqlite3";

const cache = new sqlite3("./data/cache.db");
import { generateMusicMenu } from "../../../utils/CacheMenuGenerator.js";

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
      engine.debugLog("No voice channel found, aborting...");
      return interaction.editReply("You need to join a voice channel first!");
    }
    let track = interaction.options.getAttachment("track");
    let connection = music.getConnection(interaction);
    if (track) {
      if (
        !music.allowedExts.some((extension) => track.name.endsWith(extension))
      ) {
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
      let reply = generateMusicMenu(options, 1);
      service.music_pages.set(id, 1);
      return interaction.editReply(reply);
    }
  },
};
