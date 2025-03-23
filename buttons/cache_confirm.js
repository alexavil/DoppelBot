const debug = process.env.DEBUG;
import Discord, { ButtonStyle } from "discord.js";

import fs from "fs-extra";

import path from "path";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cacheFolder = "../cache/";

export default {
  name: "cache_confirm",
  async execute(interaction) {
    let id = interaction.guild.id;
    if (debug === "true") console.log("[DEBUG] User confirmed, proceeding...");
    for (const file of await fs.readdir(path.join(__dirname, cacheFolder))) {
      await fs.unlink(path.join(__dirname, cacheFolder, file));
    }
    return interaction.update({
      content: "Your cache has been wiped successfully!",
      components: [],
      flags: Discord.MessageFlags.Ephemeral,
    });
  },
};
