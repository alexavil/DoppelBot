const Discord = require('discord.js');
const youtube = require('play-dl');
const { authorization } = require('play-dl');
const fs = require('fs');
const { AudioPlayerStatus, joinVoiceChannel, createAudioPlayer, createAudioResource, getVoiceConnection } = require('@discordjs/voice');
module.exports = {
    name: 'music',
    aliases: ['m'],
    description: 'Music-related commands',
    async execute(message, args) {
        const channel = message.member.voice.channel;
        if (!channel) {
            message.delete().catch();
            return message.channel.send('You must be in a VC to use this command!');
        };
        switch (args[0]) {
            case "play":
                if (channel && (!args[1] || ((!args[1].startsWith("https://www.youtube.com/")) && (!args[1].startsWith("https://youtu.be")) && (!args[1].startsWith("https://soundcloud.com/"))))) {
                    message.delete().catch();
                    return message.channel.send('Provide a YT or SoundCloud link to your song!')
                };
                if (channel && args.length && ((args[1].startsWith("https://www.youtube.com/")) || (args[1].startsWith("https://youtu.be")) || (args[1].startsWith("https://soundcloud.com/")))) {
                    message.delete().catch();
                    message.channel.send('Now playing: ' + args[1] + '\nRequested by: <@' + message.author + '>');
                    const connection = joinVoiceChannel({
                        channelId: channel.id,
                        guildId: channel.guild.id,
                        adapterCreator: channel.guild.voiceAdapterCreator,
                    });
                    let stream = await youtube.stream(args[1])
                    const player = createAudioPlayer();
                    const resource = createAudioResource(stream.stream, {
                        inputType: stream.type
                    });
                    player.play(resource);
                    playing = true;
                    console.log(playing);
                    const subscription = connection.subscribe(player);
                    player.on(AudioPlayerStatus.Idle, () => {
                        connection.destroy();
                    });
                };
                break;
            case "stop":
                    const connection = getVoiceConnection(channel.guild.id);
                    connection.destroy();
                    message.delete().catch();
                break;
            case "search":
                if (!args[1]) {
                    message.delete().catch();
                    return message.channel.send('Provide a search query!')
                };
                let query = args.slice(1).join(" ");
                message.reply(query);
                let yt_info = await youtube.search(query, { limit: 1 })
                let stream = await youtube.stream(yt_info[0].url)
                async function play() {
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
                            inputType: stream.type
                        });
                        player.play(resource);
                        const subscription = connection.subscribe(player);
                        player.on(AudioPlayerStatus.Idle, () => {
                            connection.destroy();
                        });
                    }
                }
                play();
                break;

        }
    },
};
