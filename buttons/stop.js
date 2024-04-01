import Discord, { ButtonStyle } from "discord.js";
const debug = process.env.DEBUG;
import { getVoiceConnection } from "@discordjs/voice";
import sqlite3 from "better-sqlite3";
const { default: common } = await import("../music.js");

const masterqueue = new sqlite3("./data/queue.db");
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
      if (debug === "true")
        console.log("[DEBUG] User is not admin or alone, stop not allowed...");
      return interaction.reply({
        content: "You are not allowed to stop!",
        ephemeral: true,
      });
    }
    const connection = getVoiceConnection(id);
    if (!connection)
      return interaction.reply({
        content: "The bot is already stopped!",
        ephemeral: true,
      });
    else {
      common.stopCounter(id);
      if (debug === "true") console.log("[DEBUG] Stopping the connection...");
      connection.destroy();
      common.removePlayer(id);
      masterqueue.prepare(`DELETE FROM guild_${id}`).run();
      return interaction.update({ content: "Stopped!", components: [], ephemeral: true });
    }
  },
};
