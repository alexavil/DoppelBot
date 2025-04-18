import Discord from "discord.js";
const { default: music } = await import("../../utils/music.js");
const { default: service } = await import("../../utils/ServiceVariables.js");

export default {
  name: "music_cancel",
  async execute(interaction) {
    let id = interaction.guild.id;
    let player = music.players.get(id);
    service.music_pages.delete(id);
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
