import engine from "../../../utils/Engine.js";
import { getVoiceConnection } from "@discordjs/voice";
import sqlite3 from "better-sqlite3";
import Discord from "discord.js";

const { default: music } = await import("../../../utils/music.js");

const queue = new sqlite3("./data/queue.db");
export default {
  data: new Discord.SlashCommandBuilder()
    .setName("disconnect")
    .setDescription("Emergency Disconnect Button"),
  async execute(interaction) {
    const id = interaction.guild.id;
    const channel = interaction.member.voice.channel;
    if (
      !interaction.channel
        .permissionsFor(interaction.user)
        .has(Discord.PermissionsBitField.Flags.BanMembers) &&
      channel.members.size !== 2
    ) {
      engine.debugLog("User is not admin or alone, stop not allowed...");
      return interaction.reply({
        content: "You are not allowed to disconnect the bot!",
        flags: Discord.MessageFlags.Ephemeral,
      });
    }
    engine.debugLog("Stopping the connection...");
    let connection = getVoiceConnection(id);
    if (connection) connection.destroy();
    music.players.delete(id);
    queue.prepare(`DELETE FROM guild_${id}`).run();
    return interaction.editReply({
      content: "Disconnected!",
      components: [],
      flags: Discord.MessageFlags.Ephemeral,
    });
  },
};
