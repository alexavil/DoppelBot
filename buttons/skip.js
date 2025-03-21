import Discord, { ButtonStyle } from "discord.js";
const debug = process.env.DEBUG;
import { getVoiceConnection } from "@discordjs/voice";
import sqlite3 from "better-sqlite3";
const { default: common } = await import("../music.js");

const masterqueue = new sqlite3("./data/queue.db");
export default {
  name: "skip",
  async execute(interaction) {
    const id = interaction.guild.id;
    const connection = getVoiceConnection(id);
    const channel = interaction.member.voice.channel;
    if (!connection) return interaction.reply("Nothing to skip!");
    if (
      !interaction.channel
        .permissionsFor(interaction.user)
        .has(Discord.PermissionsBitField.Flags.BanMembers) &&
      channel.members.size !== 2
    ) {
      if (debug === "true")
        console.log("[DEBUG] User is not admin or alone, skip not allowed...");
      return interaction.reply({
        content: "You are not allowed to skip!",
        flags: Discord.MessageFlags.Ephemeral,
      });
    }
    if (
      masterqueue
        .prepare(`SELECT * FROM guild_${id} ORDER BY ROWID LIMIT 1`)
        .get().isLooped === "true"
    ) {
      if (debug === "true")
        console.log("[DEBUG] The current track is looped, unlooping...");
      masterqueue
        .prepare(`UPDATE guild_${id} SET isLooped = 'false' LIMIT 1`)
        .run();
    }
    if (debug === "true") console.log("[DEBUG] Skipping the current track...");
    let player = common.getPlayer(id);
    player.player.stop();
    interaction.reply({ content: "Skipped!", flags: Discord.MessageFlags.Ephemeral });
  },
};
