const debug = process.env.DEBUG;
const { default: common } = await import("../music.js");
import { getVoiceConnection } from "@discordjs/voice";

export default {
  name: "pause",
  async execute(interaction) {
    const id = interaction.guild.id;
    const connection = getVoiceConnection(id);
    let player = common.getPlayer(id);
    if (!connection) return interaction.editReply("Nothing to pause!");
    switch (player.isPaused) {
      case true: {
        if (debug === "true")
          console.log("[DEBUG] Player is paused, unpausing...");
        player.player.unpause();
        player.isPaused = false;
        return interaction.editReply({ content: "Unpaused!", ephemeral: true });
      }
      case false: {
        if (debug === "true")
          console.log("[DEBUG] Player is not paused, pausing...");
        player.player.pause();
        player.isPaused = true;
        return interaction.editReply({ content: "Paused!", ephemeral: true });
      }
    }
  },
};
