const fs = require("fs-extra");
const sqlite3 = require("better-sqlite3");
const settings = new sqlite3("./data/settings.db");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  getVoiceConnection,
  AudioPlayerStatus,
} = require("@discordjs/voice");
module.exports = {
  name: "spell",
  description: "Doppel will cast a spell at you, be careful!",
  execute(message) {
    let event = settings
      .prepare(`SELECT * FROM global WHERE option = 'event_code'`)
      .get().value;
    if (event !== 6) return;
    if (!message.member.voice.channel) {
      if (event.debug === true)
        console.log("[DEBUG] No voice channel found, aborting...");
      return message.reply("You need to join a voice channel first!");
    }
    const spellFolder = "./event/halloween/spells/";

    fs.readdir(spellFolder, (err, spells) => {
      if (err) {
        console.log(err);
      }

      let randomIndex = Math.floor(Math.random() * spells.length);
      let randomSpell = spellFolder + spells[randomIndex];

      if (getVoiceConnection(message.guild.id) === undefined) {
        connection = joinVoiceChannel({
          channelId: message.member.voice.channel.id,
          guildId: message.guild.id,
          adapterCreator: message.guild.voiceAdapterCreator,
          behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause,
          },
        });
      } else return false;

      let player = createAudioPlayer();
      connection.subscribe(player);

      let resource = createAudioResource(randomSpell);

      player.play(resource);

      player.on(AudioPlayerStatus.Idle, () => {
        setTimeout(() => {
          connection.destroy();
        }, 1000)
      });
    });

    message.delete().catch();
  },
};
