const debug = process.env.DEBUG;
import sqlite3 from "better-sqlite3";
const { default: common } = await import("../../music.js");
import Discord, { ButtonStyle } from "discord.js";

const instances = new sqlite3("./data/instances_cache.db");
export default {
  data: new Discord.SlashCommandBuilder()
    .setName("search")
    .setDescription("Search a track")
    .addStringOption((option) =>
      option.setName("query").setDescription("Search query").setRequired(true),
    ),
  async execute(interaction) {
    const id = interaction.guild.id;
    if (!interaction.member.voice.channel) {
      if (debug === "true")
        console.log("[DEBUG] No voice channel found, aborting...");
      return interaction.editReply("You need to join a voice channel first!");
    }
    let default_url = instances
      .prepare(
        `SELECT * FROM instances WHERE health >= ${common.getHealth(id)} AND fails < ${common.getFails(id)} ORDER BY RANDOM() LIMIT 1`,
      )
      .get().url;
    let query = interaction.options.getString("query");
    if (debug === "true") {
      console.log(`[DEBUG] User query: ${query}...`);
      console.log("[DEBUG] Searching...");
    }
    let value = await common.searchContent(interaction, default_url, query, 0);
    if (typeof value === "string") {
      if (debug === "true")
        console.log("[DEBUG] Too many retries, aborting...");
      return interaction.editReply("Connection failed after 4 retries.");
    }
    if (!value.length) {
      if (debug === "true") console.log("[DEBUG] No content was found...");
      return interaction.editReply(
        "No content was found based on your search query!",
      );
    }
    let searchembed = new Discord.EmbedBuilder();
    let values = [];
    value.forEach((track) => {
      searchembed.addFields({
        name: track.title,
        value: track.url,
        inline: false,
      });
      let menuOption = new Discord.StringSelectMenuOptionBuilder()
        .setLabel(track.title)
        .setValue(track.url);
      values.push(menuOption);
    });
    searchembed.setTitle("Please select a track:");
    searchembed.setColor("#0099ff");
    searchembed.setFooter({
      text: "Powered by InvidJS - https://invidjs.js.org/",
    });
    const menu = new Discord.StringSelectMenuBuilder()
      .setCustomId(`selecttrack`)
      .setOptions(values)
      .setMinValues(1)
      .setMaxValues(values.length);
    const row = new Discord.ActionRowBuilder().addComponents(menu);
    return interaction.editReply({
      embeds: [searchembed],
      components: [row],
      ephemeral: true,
    });
  },
};
