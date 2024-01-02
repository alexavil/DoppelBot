const debug = process.env.DEBUG;
const owners = process.env.OWNERS.split(",");
export default {
  name: "gleave",
  description: "Leave a guild by ID!",
  execute(message, args, client) {
    if (owners.includes(message.author.id)) {
      let id = args[0];
      let guild = client.guilds.cache.get(id);
      if (guild) {
        if (debug === "true") console.log(`[DEBUG] Leaving guild ${id}...`);
        guild.leave();
      }
      message.delete().catch();
    }
  },
};
