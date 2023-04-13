const debug = require("../index");
module.exports = {
  name: "pause",
  description: "Pause the music",
  async execute(message) {
    const id = message.guild.id;
    if (debug.debug === true)
      console.log("[DEBUG] Trying to pause for " + id + "...");
    const connection = getVoiceConnection(id);
    if (!connection) return message.channel.send("Nothing to pause!");
    switch (isPaused) {
      case true: {
        if (debug.debug === true) console.log("[DEBUG] Unpausing...");
        player.unpause();
        isPaused = false;
        return message.channel.send("Unpaused!");
      }
      case false: {
        if (debug.debug === true) console.log("[DEBUG] Pausing...");
        player.pause();
        isPaused = true;
        return message.channel.send("Paused!");
      }
    }
  },
};
