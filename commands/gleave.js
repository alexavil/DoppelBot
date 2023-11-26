const debug = require("../index");
module.exports = {
  name: "gleave",
  description: "Leave a guild by ID!",
  owneronly: true,
  execute(message, args, client) {
    let id;
    if (!args[0]) {
      id = message.guild.id;
    } else id = args[0];
    let guild = client.guilds.cache.get(id);
    if (guild) {
      if (debug.debug === true) console.log(`[DEBUG] Leaving guild ${id}...`);
      guild.leave();
    }
    message.delete().catch();
  },
};
