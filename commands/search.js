const Discord = require('discord.js');
const ytdl = require('ytdl-core');
var search = require('youtube-search');
const fs = require('fs');
module.exports = {
	name: 'search',
  description: 'Search for music',
	async execute(message, args) {
		if (!args.length) {
            message.delete().catch();
             message.channel.send('Provide a search query!')
        };
		let query = args.slice(1).join(" ");
		var opts = {
			maxResults: 1,
			key: 'AIzaSyAlyZvG0HXWjlfLbg4xDp1pMMrCnfTJ2dA',
			type: 'video'
		};

		search(query, opts, function(err, results) {
		if(err) return console.log(err);

		console.log(results);
		console.log(results[0].link);
		async function play() {
		const channel = message.member.voice.channel;
        if (!channel) {
            message.delete().catch();
          return message.channel.send('You must be in a VC to use this command!');
        };
        if (channel && results) {
            message.delete().catch();
        message.channel.send('Now playing: ' + results[0].link);
        const connection = await channel.join();
        const dispatcher = connection.play(ytdl(results[0].link, {filter: "audioonly", quality: 'highestaudio', highWaterMark: 1 << 25}));

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
    }
	play();
		});
		
	},
};
