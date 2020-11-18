const Discord = require('discord.js');
module.exports = {
	name: 'spelldesc',
  description: 'Spell descriptions',
	execute(message) {
		message.delete().catch();

    const responses = [
      '-Void Hole-\nCast on yourself by reciting Void Hole. it will greatly increase your defense.',
      '-Abyss-\nFace your opponent and recite Abyss. It should scorch your enemy.',
      '-Chaos-\nFace your opponent and recite Chaos. It should freeze your enemy. ',
      '-Labyrinth-\nCast on yourself by reciting Labyrinth. It will temporarily increase your magic strength.',
      '-Eclipse-\nFace your Oppoent and recite Eclipse. Their Brain will dissolve and their IQ level will decrease.',
      "-Grand Cross-\nFace your Opponent and recite Grand Cross. With a power that should be feared, it will snatch away your enemy's strength. However, as a result of consuming large amounts of magical power, when your magical level is low, you won't be able to cast it.",
      '-Ragnarok-\nFace your opponent and recite Ragnarok. Your opponent will be temporarily frozen and their weak spot will be exposed.',     
];
        
message.channel.send(responses[Math.floor(Math.random() * responses.length)]);
	},
};