import debugLog from "../../utils/DebugHandler.js";
import { getVoiceConnection } from "@discordjs/voice";
import sqlite3 from "better-sqlite3";
import Discord from "discord.js";

const { default: music } = await import("../../utils/music.js");

const queue = new sqlite3("./data/queue.db");
export default {
  name: "stop",
  async execute(interaction) {
    const id = interaction.guild.id;
    const channel = interaction.member.voice.channel;
    if (
      !interaction.channel
        .permissionsFor(interaction.user)
        .has(Discord.PermissionsBitField.Flags.BanMembers) &&
      channel.members.size !== 2
    ) {
      
        debugLog("User is not admin or alone, stop not allowed...");
      return interaction.reply({
        content: "You are not allowed to stop!",
        flags: Discord.MessageFlags.Ephemeral,
      });
    }
    let player = music.players.get(id);
    if (!player)
      return interaction.reply({
        content: "The bot is already stopped!",
        flags: Discord.MessageFlags.Ephemeral,
      });
    else {
       debugLog("Stopping the connection...");
      let connection = getVoiceConnection(id);
      connection.destroy();
      music.players.delete(id);
      queue.prepare(`DELETE FROM guild_${id}`).run();
      return interaction.update({
        content: "Stopped!",
        components: [],
        flags: Discord.MessageFlags.Ephemeral,
      });
    }
  },
};
