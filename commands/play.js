const youtube = require("play-dl");
const {
  AudioPlayerStatus,
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} = require("@discordjs/voice");
module.exports = {
  name: "play",
  aliases: ["p"],
  description: "Play music",
  async execute(message, args) {
    let playing = false;
    let timer;
    const channel = message.member.voice.channel;
    if (!channel) {
      message.delete().catch();
      message.channel.send("You must be in a VC to use this command!");
    }
    if (
      channel &&
      (!args.length ||
        (!args[0].startsWith("https://www.youtube.com/") &&
          !args[0].startsWith("https://youtu.be") &&
          !args[0].startsWith("https://soundcloud.com/")))
    ) {
      message.delete().catch();
      message.channel.send("Provide a YT or SoundCloud link to your song!");
    }
    if (
      channel &&
      args.length &&
      (args[0].startsWith("https://www.youtube.com/") ||
        args[0].startsWith("https://youtu.be") ||
        args[0].startsWith("https://soundcloud.com/"))
    ) {
      message.delete().catch();
      message.channel.send(
        "Now playing: " + args[0] + "\nRequested by: <@" + message.author + ">"
      );
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });
      let stream = await youtube.stream(args[0]);
      const player = createAudioPlayer();
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
      });
      clearTimeout(timer);
      player.play(resource);
      playing = true;
      console.log(playing);
      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
      });
    }
  },
};
