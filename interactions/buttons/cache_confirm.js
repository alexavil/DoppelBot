import Discord from "discord.js";

import fs from "fs-extra";

import path from "path";

import { dirname } from "path";
import { fileURLToPath } from "url";
import debugLog from "../../utils/DebugHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cacheFolder = "../../cache/";

const { default: music } = await import("../../utils/music.js");

export default {
  name: "cache_confirm",
  async execute(interaction) {
    debugLog("User confirmed, proceeding...");
    for (const file of await fs.readdir(path.join(__dirname, cacheFolder))) {
      await fs.unlink(path.join(__dirname, cacheFolder, file));
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
