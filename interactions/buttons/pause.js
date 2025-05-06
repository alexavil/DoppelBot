import debugLog from "../../utils/DebugHandler.js";
import Discord from "discord.js";

const { default: music } = await import("../../utils/music.js");

export default {
  name: "pause",
  async execute(interaction) {
    const id = interaction.guild.id;
    let player = music.players.get(id);
    if (!player) return interaction.reply("Nothing to pause!");
    switch (player._state.status) {
      case "paused": {
        debugLog("Player is paused, unpausing...");
        player.unpause();
        return interaction.reply({
          content: "Unpaused!",
          flags: Discord.MessageFlags.Ephemeral,
        });
      }
      case "playing": {
        debugLog("Player is not paused, pausing...");
        player.pause();
        return interaction.reply({
          content: "Paused!",
          flags: Discord.MessageFlags.Ephemeral,
        });
      }
    }
  },
};
