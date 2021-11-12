const Discord = require('discord.js');
const youtube = require('play-dl');
const fs = require('fs');
const { AudioPlayerStatus, joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
module.exports = {
	name: 'search',
  description: 'Search for music',
	async execute(message, args) {
		if (!args.length) {
            message.delete().catch();
             message.channel.send('Provide a search query!')
        };
		let query = args.slice(1).join(" ");
		let yt_info = await youtube.search(query, { limit : 1 })
		let stream = await youtube.stream(yt_info[0].url)
		async function play() {
		const channel = message.member.voice.channel;
        if (!channel) {
            message.delete().catch();
          return message.channel.send('You must be in a VC to use this command!');
        };
        if (channel && yt_info[0]) {
            message.delete().catch();
        message.channel.send('Now playing: ' + yt_info[0].url + '\nRequested by: <@' + message.author + '>');
        const connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
        });
        const player = createAudioPlayer();
        const resource = createAudioResource(stream.stream, {
            inputType : stream.type
        });
        player.play(resource);
        const subscription = connection.subscribe(player);
				player.on(AudioPlayerStatus.Idle, () => {
			function disconnect() {
				connection.destroy();
			};
			setTimeout(disconnect, 60000);
		});
		}
    }
	play();
	
		
	},
};
