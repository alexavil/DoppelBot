import debugLog from "../../utils/DebugHandler.js";

export default {
  name: "gleave",
  async execute(interaction) {
     debugLog(`Starting guild deletion...`);
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
