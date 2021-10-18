const Discord = require('discord.js');
const fs = require('fs');
const { getVoiceConnection } = require('@discordjs/voice');
module.exports = {
	name: 'stop',
  description: 'Stop music',
	 execute(message) {
                const channel = message.member.voice.channel;
                if (!channel) {
                  message.delete().catch();
                  message.channel.send('You must be in a VC to use this command!');
                } else {
                const connection = getVoiceConnection(channel.guild.id);
                connection.destroy();
                message.delete().catch();
                };
	},
};
