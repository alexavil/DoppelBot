const Discord = require('discord.js');
module.exports = {
	name: 'spell',
  description: 'Doppel will cast a spell at you, be careful!',
	execute(message) {

    const chants = [
      'https://cdn.discordapp.com/attachments/694943149142966396/697864041145827398/abyss.wav',
      'https://cdn.discordapp.com/attachments/694943149142966396/697864041145827398/chaos.wav',
      'https://cdn.discordapp.com/attachments/694943149142966396/697864041145827398/eclipse.wav',
      'https://cdn.discordapp.com/attachments/694943149142966396/697864041145827398/grandcross.wav',
      'https://cdn.discordapp.com/attachments/694943149142966396/697864041145827398/labyrinth.wav',
      'https://cdn.discordapp.com/attachments/694943149142966396/697864041145827398/ragnarok.wav',
      'https://cdn.discordapp.com/attachments/694943149142966396/697864041145827398/voidhole.wav',     
];
        
message.channel.send("I am strong... Which should prove useful to you. That should suffice, no?", {
  file: chants[Math.floor(Math.random() * chants.length)]
});
	},
};