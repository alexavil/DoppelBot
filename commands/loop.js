const debug = require("../index");
const sqlite3 = require("better-sqlite3");
const { getVoiceConnection } = require("@discordjs/voice");

const masterqueue = new sqlite3("./data/queue.db");
module.exports = {
  name: "loop",
  description: "Loop the music",
  aliases: ["l"],
  async execute(message) {
    const id = message.guild.id;
    const channel = message.member.voice.channel;
    const connection = getVoiceConnection(id);
    if (!channel) return message.reply("You must be in a voice channel!");
    if (!connection) return message.reply("Nothing to loop!");
    switch (
      masterqueue
        .prepare(`SELECT * FROM guild_${id} ORDER BY ROWID LIMIT 1`)
        .get().isLooped
    ) {
      case "true": {
        if (debug.debug === true)
          console.log("[DEBUG] Unlooping the current track...");
        masterqueue
          .prepare(`UPDATE guild_${id} SET isLooped = 'false' LIMIT 1`)
          .run();
        return message.reply("The current track will not be looped!");
      }
      case "false": {
        if (debug.debug === true)
          console.log("[DEBUG] Looping the current track...");
        masterqueue
          .prepare(`UPDATE guild_${id} SET isLooped = 'true' LIMIT 1`)
          .run();
        return message.reply("The current track will be looped!");
      }
    }
  },
};
