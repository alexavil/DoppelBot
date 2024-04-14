const { default: common } = await import("../music.js");
const debug = process.env.DEBUG;

export default {
  name: "selecttrack",
  async execute(interaction) {
    let id = interaction.guild.id;
    if (debug === "true")
      console.log(`[DEBUG] Adding track(s) to the queue...`);
    interaction.update({
        content: "Success!",
        embeds: [],
        components: [],
    });
    const tracks = interaction.values;
    for (const track of tracks) {
      let url = track;
      await common.getVideo(url, interaction, false, true, 0);
    }
  },
};
