import Discord from "discord.js";
import { convertToString } from "../utils/TimeConverter.js";
const { default: music } = await import("../utils/music.js");

export default {
  name: "seek",
  async execute(interaction) {
    const id = interaction.guild.id;
    let player = music.players.get(id);
    if (!player)
      return interaction.reply({
        content: "No tracks are playing!",
        flags: Discord.MessageFlags.Ephemeral,
      });
    let length = convertToString(player._state.playbackDuration);
    return interaction.reply({
      content: `Current time: ${length}`,
      flags: Discord.MessageFlags.Ephemeral,
    });
  },
};
