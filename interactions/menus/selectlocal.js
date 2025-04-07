const { default: music } = await import("../../utils/music.js");
const debug = process.env.DEBUG;

import sqlite3 from "better-sqlite3";

const cache = new sqlite3("./data/cache.db");

export default {
  name: "selectlocal",
  async execute(interaction) {
    let id = interaction.guild.id;
    if (debug === "true")
      console.log(`[DEBUG] Adding track(s) to the queue...`);
    let connection = music.getConnection(interaction);
    const tracks = interaction.values;
    music.menu_pages.delete(id);
    for (const track of tracks) {
      let file = track;
      let data = cache.prepare("SELECT * FROM files_directory WHERE filename = ?").get(file);
      music.addToQueue(interaction.guild.id, data.name, file, interaction.member.id);
    }
    let player = music.players.get(id);
    if (!player || player._state.status === "idle") {
      music.playLocalFile(
        music.getFromQueue(interaction.guild.id).name,
        connection,
        interaction,
      );
      music.announceTrack(
        music.getFromQueue(interaction.guild.id).track,
        interaction.member.id,
        interaction,
      );
    }
    interaction.update({
      content: "Added to the queue!",
      embeds: [],
      components: [],
    });
  },
};
