const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const fs = require('fs');
module.exports = {
	name: 'play',
  description: 'Play music',
	async execute(message, args) {
        const channel = message.member.voice.channel;
        if (!channel) {
            message.delete().catch();
          message.channel.send('You must be in a VC to use this command!');
        };
         if (!args.length || ((!args[0].startsWith("https://www.youtube.com/")) && (!args[0].startsWith("https://youtu.be")))) {
            message.delete().catch();
             message.channel.send('Provide a YT link to your song!')
        };
        if (channel && args.length && ((args[0].startsWith("https://www.youtube.com/")) || (args[0].startsWith("https://youtu.be")))) {
            message.delete().catch();
        message.channel.send('Now playing: ' + args[0]);
        const connection = await channel.join();
        const dispatcher = connection.play(ytdl(args[0], {filter: "audioonly", quality: 'highestaudio', highWaterMark: 1 << 25}));

        dispatcher.on('start', () => {
	        console.log('Music is now playing!');
        });

        dispatcher.on('finish', () => {
            connection.channel.leave();
	        console.log('Music has finished playing!');
        });

        // Always remember to handle errors appropriately!
        dispatcher.on('error', console.error);
    }
	},
};
