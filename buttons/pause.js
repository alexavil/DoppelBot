const debug = process.env.DEBUG;
const { default: common } = await import("../music.js");
import { getVoiceConnection } from "@discordjs/voice";

export default {
  name: "pause",
  async execute(interaction) {
    const id = interaction.guild.id;
    const connection = getVoiceConnection(id);
    let player = common.getPlayer(id);
    if (!connection) return interaction.reply("Nothing to pause!");
    switch (player.isPaused) {
      case true: {
        if (debug === "true")
          console.log("[DEBUG] Player is paused, unpausing...");
        player.player.unpause();
        player.isPaused = false;
        return interaction.reply({ content: "Unpaused!", flags: Discord.MessageFlags.Ephemeral });
      }
      case false: {
        if (debug === "true")
          console.log("[DEBUG] Player is not paused, pausing...");
        player.player.pause();
        player.isPaused = true;
        return interaction.reply({ content: "Paused!", flags: Discord.MessageFlags.Ephemeral });
      }
    }
  },
};
