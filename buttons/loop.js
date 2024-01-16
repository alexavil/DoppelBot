const debug = process.env.DEBUG;
import sqlite3 from "better-sqlite3";
import { getVoiceConnection } from "@discordjs/voice";

const masterqueue = new sqlite3("./data/queue.db");
export default {
  name: "loop",
  async execute(interaction) {
    const id = interaction.guild.id;
    const channel = interaction.member.voice.channel;
    const connection = getVoiceConnection(id);
    if (!channel) return interaction.editReply("You must be in a voice channel!");
    if (!connection) return interaction.editReply("Nothing to loop!");
    switch (
      masterqueue
        .prepare(`SELECT * FROM guild_${id} ORDER BY ROWID LIMIT 1`)
        .get().isLooped
    ) {
      case "true": {
        if (debug === "true")
          console.log("[DEBUG] Unlooping the current track...");
        masterqueue
          .prepare(`UPDATE guild_${id} SET isLooped = 'false' LIMIT 1`)
          .run();
        return interaction.editReply({ content: "The current track will not be looped!", ephemeral: true });
      }
      case "false": {
        if (debug === "true")
          console.log("[DEBUG] Looping the current track...");
        masterqueue
          .prepare(`UPDATE guild_${id} SET isLooped = 'true' LIMIT 1`)
          .run();
        return interaction.editReply({ content: "The current track will not be looped!", ephemeral: true });
      }
    }
  },
};
