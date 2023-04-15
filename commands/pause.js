const debug = require("../index");
const common = require("../music");
const { getVoiceConnection } = require("@discordjs/voice");
module.exports = {
  name: "pause",
  description: "Pause the music",
  async execute(message) {
    const id = message.guild.id;
    const connection = getVoiceConnection(id);
    if (!connection) return message.channel.send("Nothing to pause!");
    let player = common.getPlayer(id);
    switch (player.isPaused) {
      case true: {
        if (debug.debug === true) console.log("[DEBUG] Player is paused, unpausing...");
        player.player.unpause();
        player.isPaused = false;
        return message.channel.send("Unpaused!");
      }
      case false: {
        if (debug.debug === true) console.log("[DEBUG] Player is not paused, pausing...");
        player.player.pause();
        player.isPaused = true;
        return message.channel.send("Paused!");
      }
    }
  },
};
