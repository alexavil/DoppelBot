const { default: music } = await import("../utils/music.js");
const debug = process.env.DEBUG;

export default {
  name: "selectlocal",
  async execute(interaction) {
    let id = interaction.guild.id;
    if (debug === "true")
      console.log(`[DEBUG] Adding track(s) to the queue...`);
    interaction.update({
      content: "Success!",
      embeds: [],
      components: [],
    });
    let connection = music.getConnection(interaction);
    const tracks = interaction.values;
    for (const track of tracks) {
      let file = track;
      music.addToQueue(interaction.guild.id, file, file, interaction.channel.id, interaction.member.id);
    }
    music.playLocalFile(music.getFromQueue(interaction.guild.id).name, connection);
    music.announceTrack(music.getFromQueue(interaction.guild.id).name, interaction.member.id, interaction.channel.id);
  },
};