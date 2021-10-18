const Discord = require('discord.js');
const youtube = require('play-dl');
const { authorization } = require('play-dl');
const fs = require('fs');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
module.exports = {
	name: 'play',
  description: 'Play music',
	async execute(message, args) {
        const channel = message.member.voice.channel;
        if (!channel) {
            message.delete().catch();
          message.channel.send('You must be in a VC to use this command!');
        };
         if (!args.length || ((!args[0].startsWith("https://www.youtube.com/")) && (!args[0].startsWith("https://youtu.be")) && (!args[0].startsWith("https://soundcloud.com/")))) {
            message.delete().catch();
             message.channel.send('Provide a YT or SoundCloud link to your song!')
        };
        if (channel && args.length && ((args[0].startsWith("https://www.youtube.com/")) || (args[0].startsWith("https://youtu.be")) || (args[0].startsWith("https://soundcloud.com/")))) {
            message.delete().catch();
        message.channel.send('Now playing: ' + args[0]);
        const connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
        });
        let stream = await youtube.stream(args[0])
        const player = createAudioPlayer();
        const resource = createAudioResource(stream.stream, {
            inputType : stream.type
        });
        player.play(resource);
        const subscription = connection.subscribe(player);
    }
	},
};
