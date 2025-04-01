import sqlite3 from "better-sqlite3";
import Discord from "discord.js";
const debug = process.env.DEBUG;
const { default: music } = await import("../utils/music.js");

const queue = new sqlite3("./data/queue.db");
export default {
  name: "skip",
  async execute(interaction) {
    const id = interaction.guild.id;
    const channel = interaction.member.voice.channel;
    let player = music.players.get(id);
    if (!player) return interaction.reply("Nothing to skip!");
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
    if ((music.getFromQueue(id).isLooped = "true")) {
      if (debug === "true")
        console.log("[DEBUG] The current track is looped, unlooping...");
      queue.prepare(`UPDATE guild_${id} SET isLooped = 'false' LIMIT 1`).run();
    }
    if (debug === "true") console.log("[DEBUG] Skipping the current track...");
    player.stop();
    interaction.reply({
      content: "Skipped!",
      flags: Discord.MessageFlags.Ephemeral,
    });
  },
};
