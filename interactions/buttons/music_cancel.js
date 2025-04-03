import Discord from "discord.js";
const { default: music } = await import("../../utils/music.js");

export default {
  name: "music_cancel",
  async execute(interaction) {
    let connection = music.getConnection(interaction);
    connection.destroy();
    return interaction.update({
      content: "Cancelled!",
      components: [],
      flags: Discord.MessageFlags.Ephemeral,
    });
  },
};
