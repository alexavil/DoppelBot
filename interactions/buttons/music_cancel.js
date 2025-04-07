import Discord from "discord.js";
const { default: music } = await import("../../utils/music.js");

export default {
  name: "music_cancel",
  async execute(interaction) {
    let id = interaction.guild.id;
    let player = music.players.get(id);
    if (!player || player._state.status === "idle") {
      let connection = music.getConnection(interaction);
      connection.destroy();
    }
    return interaction.update({
      content: "Cancelled!",
      components: [],
      flags: Discord.MessageFlags.Ephemeral,
    });
  },
};
