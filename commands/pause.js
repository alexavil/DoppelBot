const debug = process.env.DEBUG;
const common = await import("../music.js");
import { getVoiceConnection } from "@discordjs/voice";
export default {
  name: "pause",
  description: "Pause the music",
  async execute(message) {
    const id = message.guild.id;
    const connection = getVoiceConnection(id);
    let player = common.getPlayer(id);
    if (!connection) return message.channel.send("Nothing to pause!");
    switch (player.isPaused) {
      case true: {
        if (debug === "true")
          console.log("[DEBUG] Player is paused, unpausing...");
        player.player.unpause();
        player.isPaused = false;
        return message.channel.send("Unpaused!");
      }
      case false: {
        if (debug === "true")
          console.log("[DEBUG] Player is not paused, pausing...");
        player.player.pause();
        player.isPaused = true;
        return message.channel.send("Paused!");
      }
    }
  },
};
