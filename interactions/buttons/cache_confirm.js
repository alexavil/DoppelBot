import Discord from "discord.js";

import fs from "fs-extra";

import path from "path";
import engine from "../../utils/Engine.js";

import musicEngine from "../../utils/music.js";

export default {
  name: "cache_confirm",
  async execute(interaction) {
    engine.debugLog("User confirmed, proceeding...");
    for (const file of await fs.readdir(engine.cacheFolder)) {
      await fs.unlink(path.join(engine.cacheFolder, file));
    }
    music.connections.forEach((conn) => {
      conn.destroy();
      music.clearQueue(conn.joinConfig.guildId);
      music.connections.delete(conn.joinConfig.guildId);
    });
    return interaction.update({
      content: "Your cache has been wiped successfully!",
      components: [],
      flags: Discord.MessageFlags.Ephemeral,
    });
  },
};
