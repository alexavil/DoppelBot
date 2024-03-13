import Discord from "discord.js";
import * as InvidJS from "@invidjs/invid-js";
const debug = process.env.DEBUG;
const { default: common } = await import("../../music.js");

export default {
  data: new Discord.SlashCommandBuilder()
    .setName("controls")
    .setDescription("Display player controls (VC only)"),
  async execute(interaction) {
    if (!interaction.member.voice.channel) {
      if (debug === "true")
        console.log("[DEBUG] No voice channel found, aborting...");
      return interaction.editReply("You need to join a voice channel first!");
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

    return interaction.editReply({
      content: "Use these buttons to control the playback.",
      components: [row],
      ephemeral: true,
    });
  },
};
