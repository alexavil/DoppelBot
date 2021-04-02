const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const fs = require('fs');
module.exports = {
	name: 'stop',
  description: 'Stop music',
	 execute(message) {
                const channel = message.member.voice.channel;
                if (!channel) {
                  message.delete().catch();
                  message.channel.send('You must be in a VC to use this command!');
                } else {
                channel.leave();
                message.delete().catch();
                };
	},
};
