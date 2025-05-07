import engine from "../../utils/Engine.js";

export default {
  name: "gleave",
  async execute(interaction) {
    engine.debugLog(`Starting guild deletion...`);
    const guilds = interaction.values;
    for (const guild of guilds) {
      interaction.client.guilds.cache.get(guild).leave();
    }
    return interaction.update({
      content: "Left guild successfully!",
      components: [],
    });
  },
};
