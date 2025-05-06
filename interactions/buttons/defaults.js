import debugLog from "../../utils/DebugHandler.js";
import Discord, { ButtonStyle } from "discord.js";

export default {
  name: "defaults",
  async execute(interaction) {
    const id = interaction.guild.id;

    debugLog(`Preparing to reset settings for ${id}...`);

    debugLog("Confirmation required - awaiting user input...");
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
