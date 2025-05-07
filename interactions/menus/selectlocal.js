import engine from "../../utils/Engine.js";
const { default: music } = await import("../../utils/music.js");

import sqlite3 from "better-sqlite3";

const cache = new sqlite3("./data/cache.db");
const { default: service } = await import("../../utils/Engine.js");

export default {
  name: "selectlocal",
  async execute(interaction) {
    let id = interaction.guild.id;

    engine.debugLog(`Adding track(s) to the queue...`);
    let connection = music.getConnection(interaction);
    const tracks = interaction.values;
    service.music_pages.delete(id);
    for (const track of tracks) {
      let file = track;
      let data = cache
        .prepare("SELECT * FROM files_directory WHERE filename = ?")
        .get(file);
      music.addToQueue(
        interaction.guild.id,
        data.name,
        file,
        interaction.member.id,
      );
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
