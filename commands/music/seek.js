const debug = process.env.DEBUG;
const { default: common } = await import("../../music.js");
import { getVoiceConnection } from "@discordjs/voice";
import { convertToString } from "../../utils/TimeConverter.js";
import Discord from "discord.js";
export default {
  data: new Discord.SlashCommandBuilder()
  .setName("seek")
  .setDescription("Get current position in a song"),
  async execute(interaction) {
    const id = interaction.guild.id;
    const connection = getVoiceConnection(id);
    let player = common.getPlayer(id);
    if (!connection) return interaction.reply("No tracks are playing!");
    let length = convertToString(player.time);
    return interaction.reply(
      `Current time: ${length} / ${player.video.length}`,
    );
  },
};
