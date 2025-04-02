const debug = process.env.DEBUG;
import Discord, { ButtonStyle } from "discord.js";

export default {
  name: "defaults",
  async execute(interaction) {
    const id = interaction.guild.id;
    if (debug === "true")
      console.log(`[DEBUG] Preparing to reset settings for ${id}...`);
    if (debug === "true")
      console.log("[DEBUG] Confirmation required - awaiting user input...");
    const confirm = new Discord.ButtonBuilder()
      .setCustomId(`def_confirm`)
      .setLabel(`Yes`)
      .setStyle(ButtonStyle.Danger);
    const cancel = new Discord.ButtonBuilder()
      .setCustomId(`cancel`)
      .setLabel(`No`)
      .setStyle(ButtonStyle.Primary);
    const row = new Discord.ActionRowBuilder().addComponents(confirm, cancel);
    interaction.update({
      content: `**ALERT:** This action will reset your server settings! Are you sure you want to proceed?`,
      components: [row],
      embeds: [],
      flags: Discord.MessageFlags.Ephemeral,
    });
  },
};
