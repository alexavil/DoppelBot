import Discord from "discord.js";
const debug = process.env.DEBUG;
const { default: common } = await import("../../music.js");
import sqlite3 from "better-sqlite3";
const instances = new sqlite3("./data/instances_cache.db");

export default {
  data: new Discord.SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a track")
    .addStringOption(option =>
			option
				.setName('track')
				.setDescription('Invidious or YT link')
        .setRequired(true)),
  async execute(interaction) {
  
    const id = interaction.guild.id;
    if (!interaction.member.voice.channel) {
      if (debug.debug === true)
        console.log("[DEBUG] No voice channel found, aborting...");
      return interaction.updateReply("You need to join a voice channel first!");
    }
    let default_url = instances.prepare('SELECT * FROM instances ORDER BY RANDOM() LIMIT 1').get().url;
    console.log(default_url);
    let url = interaction.options.getString("track");
    if (common.disallowedLinks.some((link) => url.startsWith(link))) {
      if (debug.debug === true)
        console.log("[DEBUG] YouTube link detected, redirecting to random instance...");
      if (url.includes("/watch?v=")) {
        url = default_url + "/watch?v=" + url.split("=")[1];
      }
      if (url.includes("/playlist?list=")) {
        url = default_url + "/playlist?list=" + url.split("=")[1];
      }
      if (url.startsWith("https://youtu.be/")) {
        url = default_url + "/watch?v=" + url.split("e/")[1];
      }
    }
    if (url.match(/[a-zA-Z0-9_-]{11}/) && url.length === 11) {
      if (debug.debug === true)
        console.log("[DEBUG] ID detected, redirecting to random instance...");
      interaction.channel.send(
        "Your track will be played using a random Invidious instance.",
      );
      url = default_url + "/watch?v=" + url;
    }
    common.endTimeout(id);
    if (debug.debug === true) console.log(`[DEBUG] Validating ${url}...`);
    if (url.includes("/watch?v=")) {
      await common.getVideo(url, interaction, false, true, 0);
    }
    if (url.includes("/playlist?list=")) {
      await common.getPlaylist(url, interaction);
    }
  },
};
