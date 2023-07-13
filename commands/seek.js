const debug = require("../index");
const common = require("../music");
const { getVoiceConnection } = require("@discordjs/voice");
module.exports = {
  name: "seek",
  description: "Seek the current position of the song",
  async execute(message) {
    const id = message.guild.id;
    const connection = getVoiceConnection(id);
    let player = common.getPlayer(id);
    if (!connection) return message.channel.send("No tracks are playing!");
    let hours = Math.floor(player.time / 3600);
    let minutes = Math.floor(player.time / 60) % 60;
    let seconds = player.time % 60;
    let length = [hours, minutes, seconds]
      .map((v) => (v < 10 ? "0" + v : v))
      .filter((v, i) => v !== "00" || i > 0)
      .join(":");
    return message.channel.send(
      `Current time: ${length} / ${player.video.lengthString}`,
    );
  },
};
