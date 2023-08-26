const debug = require("../index");
const common = require("../music");
const { getVoiceConnection } = require("@discordjs/voice");
const sqlite3 = require("better-sqlite3");

const settings = new sqlite3("./data/settings.db");
module.exports = {
  name: "pause",
  description: "Pause the music",
  async execute(message) {
    const id = message.guild.id;
    if (settings.prepare(`SELECT * FROM guild_${id} WHERE option = ?`).get("music_mode").value === "radio")
      return message.reply("You can't use this command while tuned to 85.2 FM!");
    const connection = getVoiceConnection(id);
    let player = common.getPlayer(id);
    if (!connection) return message.channel.send("Nothing to pause!");
    switch (player.isPaused) {
      case true: {
        if (debug.debug === true)
          console.log("[DEBUG] Player is paused, unpausing...");
        player.player.unpause();
        player.isPaused = false;
        return message.channel.send("Unpaused!");
      }
      case false: {
        if (debug.debug === true)
          console.log("[DEBUG] Player is not paused, pausing...");
        player.player.pause();
        player.isPaused = true;
        return message.channel.send("Paused!");
      }
    }
  },
};
