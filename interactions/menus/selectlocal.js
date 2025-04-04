const { default: music } = await import("../../utils/music.js");
const debug = process.env.DEBUG;

export default {
  name: "selectlocal",
  async execute(interaction) {
    let id = interaction.guild.id;
    if (debug === "true")
      console.log(`[DEBUG] Adding track(s) to the queue...`);
    let connection = music.getConnection(interaction);
    const tracks = interaction.values;
    for (const track of tracks) {
      let file = track;
      music.addToQueue(interaction.guild.id, file, file, interaction.member.id);
    }
    let player = music.players.get(id);
    if (!player || player._state.status === "idle") {
      music.playLocalFile(
        music.getFromQueue(interaction.guild.id).name,
        connection,
        interaction,
      );
      music.announceTrack(
        music.getFromQueue(interaction.guild.id).name,
        interaction.member.id,
        interaction,
      );
    }
    interaction.update({
      content: "Added to the queue!",
      embeds: [],
      components: [],
    });
  },
};
