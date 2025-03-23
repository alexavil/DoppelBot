const debug = process.env.DEBUG;
import Discord from "discord.js";
import sqlite3 from "better-sqlite3";
import { getVoiceConnection } from "@discordjs/voice";

const queue = new sqlite3("./data/queue.db");
export default {
  name: "loop",
  async execute(interaction) {
    const id = interaction.guild.id;
    const channel = interaction.member.voice.channel;
    const connection = getVoiceConnection(id);
    if (!channel) return interaction.reply("You must be in a voice channel!");
    if (!connection) return interaction.reply("Nothing to loop!");
    switch (
      queue.prepare(`SELECT * FROM guild_${id} ORDER BY ROWID LIMIT 1`).get()
        .isLooped
    ) {
      case "true": {
        if (debug === "true")
          console.log("[DEBUG] Unlooping the current track...");
        queue
          .prepare(`UPDATE guild_${id} SET isLooped = 'false' LIMIT 1`)
          .run();
        return interaction.reply({
          content: "The current track will not be looped!",
          flags: Discord.MessageFlags.Ephemeral,
        });
      }
      case "false": {
        if (debug === "true")
          console.log("[DEBUG] Looping the current track...");
        queue.prepare(`UPDATE guild_${id} SET isLooped = 'true' LIMIT 1`).run();
        return interaction.reply({
          content: "The current track will be looped!",
          flags: Discord.MessageFlags.Ephemeral,
        });
      }
    }
  },
};
