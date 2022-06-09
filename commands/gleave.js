const Discord = require("discord.js");
module.exports = {
  name: "gleave",
  description: "Leave a guild by ID!",
  execute(message, args, client) {
    if (
      message.author.id === "332148103803174913" ||
      message.author.id === "788097137124442122"
    ) {
      let id = args[0];
      let guild = client.guilds.cache.get(id);
      guild.leave();
      message.delete().catch();
    }
  },
};
