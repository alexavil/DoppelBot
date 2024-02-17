const debug = process.env.DEBUG;
export default {
  name: "gleave",
  async execute(interaction) {
    if (debug === "true") console.log(`[DEBUG] Starting guild deletion...`);
    const guilds = interaction.values;
    for (const guild of guilds) {
      interaction.client.guilds.cache.get(guild).leave();
    }
    return interaction.update({ content: "Left guild successfully!", components: [] });
  },
};
