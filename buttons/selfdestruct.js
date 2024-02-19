const debug = process.env.DEBUG;
import Discord, { ButtonStyle } from "discord.js";

export default {
  name: "selfdestruct",
  async execute(interaction) {
    const id = interaction.guild.id;
    if (debug === "true")
      console.log(`[DEBUG] Preparing to reset settings for ALL GUILDS!!!`);
    if (debug === "true")
      console.log("[DEBUG] Confirmation required - awaiting user input...");
    const confirm = new Discord.ButtonBuilder()
      .setCustomId(`sd_confirm`)
      .setLabel(`Yes`)
      .setStyle(ButtonStyle.Danger);
    const cancel = new Discord.ButtonBuilder()
      .setCustomId(`cancel`)
      .setLabel(`No`)
      .setStyle(ButtonStyle.Primary);
    const row = new Discord.ActionRowBuilder().addComponents(confirm, cancel);
    interaction.reply({
      content: `**ALERT:** This action will wipe settings and tags for ALL GUILDS and reset the bot!!! Are you sure you want to proceed?`,
      components: [row],
      ephemeral: true,
    });
  },
};
