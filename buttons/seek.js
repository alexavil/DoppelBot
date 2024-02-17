const debug = process.env.DEBUG;
const { default: common } = await import("../music.js");
import { getVoiceConnection } from "@discordjs/voice";
import { convertToString } from "../utils/TimeConverter.js";
export default {
  name: "seek",
  async execute(interaction) {
    const id = interaction.guild.id;
    const connection = getVoiceConnection(id);
    let player = common.getPlayer(id);
    if (!connection)
      return interaction.reply({
        content: "No tracks are playing!",
        ephemeral: true,
      });
    let length = convertToString(player.time);
    return interaction.reply({
      content: `Current time: ${length} / ${player.video.length}`,
      ephemeral: true,
    });
  },
};
