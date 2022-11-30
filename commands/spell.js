module.exports = {
  name: "spell",
  description: "Doppel will cast a spell at you, be careful!",
  execute(message) {
    message.delete().catch();

    const chants = [
      "https://cdn.discordapp.com/attachments/694943149142966396/697864041145827398/abyss.wav",
      "https://cdn.discordapp.com/attachments/694943149142966396/697864042902978650/chaos.wav",
      "https://cdn.discordapp.com/attachments/694943149142966396/697864045977403452/eclipse.wav",
      "https://cdn.discordapp.com/attachments/694943149142966396/697864046611005561/grandcross.wav",
      "https://cdn.discordapp.com/attachments/694943149142966396/697864047546204190/labyrinth.wav",
      "https://cdn.discordapp.com/attachments/694943149142966396/697864048909353064/ragnarok.wav",
      "https://cdn.discordapp.com/attachments/694943149142966396/697864050767298700/voidhole.wav",
    ];

    message.channel.send(
      "I am strong... Which should prove useful to you. That should suffice, no?",
      {
        files: [chants[Math.floor(Math.random() * chants.length)]],
      }
    );
  },
};
