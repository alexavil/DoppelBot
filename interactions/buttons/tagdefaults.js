import engine from "../../utils/Engine.js";
import Discord, { ButtonStyle } from "discord.js";

export default {
  name: "tagdefaults",
  async execute(interaction) {
    const id = interaction.guild.id;

    engine.debugLog(`Preparing to clear tags for ${id}...`);

    engine.debugLog("Confirmation required - awaiting user input...");
    const confirm = new Discord.ButtonBuilder()
      .setCustomId(`tagdef_confirm`)
      .setLabel(`Yes`)
      .setStyle(ButtonStyle.Danger);
    const cancel = new Discord.ButtonBuilder()
      .setCustomId(`cancel`)
      .setLabel(`No`)
      .setStyle(ButtonStyle.Primary);
    const row = new Discord.ActionRowBuilder().addComponents(confirm, cancel);
    interaction.update({
      content: `**ALERT:** This action will wipe your tags! Are you sure you want to proceed?`,
      components: [row],
      embeds: [],
      flags: Discord.MessageFlags.Ephemeral,
    });
  },
};
