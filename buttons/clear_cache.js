const debug = process.env.DEBUG;
import Discord, { ButtonStyle } from "discord.js";

export default {
    name: "clear_cache",
    async execute(interaction) {
            const id = interaction.guild.id;
            if (debug === "true")
              console.log(`[DEBUG] Preparing to clear cache for ${id}...`);
            if (debug === "true")
              console.log("[DEBUG] Confirmation required - awaiting user input...");
            const confirm = new Discord.ButtonBuilder()
              .setCustomId(`cache_confirm`)
              .setLabel(`Yes`)
              .setStyle(ButtonStyle.Danger);
            const cancel = new Discord.ButtonBuilder()
              .setCustomId(`cancel`)
              .setLabel(`No`)
              .setStyle(ButtonStyle.Primary);
            const row = new Discord.ActionRowBuilder().addComponents(confirm, cancel);
            interaction.update({
              content: `**ALERT:** This action will wipe your music cache, requiring users to upload music files again! Are you sure you want to proceed?`,
              components: [row],
              embeds: [],
              flags: Discord.MessageFlags.Ephemeral,
            });
    },
  };