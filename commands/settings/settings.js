import Discord, { ButtonStyle } from "discord.js";
import sqlite3 from "better-sqlite3";
const settings = new sqlite3("./data/settings.db");
const owners = process.env.OWNERS.split(",");
export default {
  data: new Discord.SlashCommandBuilder()
    .setName("settings")
    .setDescription("Manage server settings")
    .setDefaultMemberPermissions(Discord.PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const id = interaction.guild.id;
    const notifbtn = new Discord.ButtonBuilder()
      .setCustomId(`notifications`)
      .setLabel(`Toggle service notifications`)
      .setStyle(ButtonStyle.Primary);
    const healthbtn = new Discord.ButtonBuilder()
      .setCustomId(`sethealth`)
      .setLabel(`Invidious: Set health`)
      .setStyle(ButtonStyle.Primary);
    const timeoutbtn = new Discord.ButtonBuilder()
      .setCustomId(`settimeout`)
      .setLabel(`Set VC timeout`)
      .setStyle(ButtonStyle.Primary);
    const defaultbtn = new Discord.ButtonBuilder()
      .setCustomId(`defaults`)
      .setLabel(`Reset to defaults`)
      .setStyle(ButtonStyle.Danger);
    const row = new Discord.ActionRowBuilder().addComponents(
      notifbtn,
      healthbtn,
      timeoutbtn,
      defaultbtn,
    );
    const settingsembed = new Discord.EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Server Settings for " + interaction.guild.name)
      .addFields(
        {
          name: "**Service Notifications**",
          value:
            "Should the bot send alerts and notifications?\nCurrent value: `" +
            settings
              .prepare(
                `SELECT * FROM guild_${id} WHERE option = 'notifications'`,
              )
              .get().value +
            "`",
        },
        {
          name: "**Disconnect Timeout**",
          value:
            "How long will the bot idle before disconnecting from a voice channel?\nCurrent value: `" +
            parseInt(
              settings
                .prepare(
                  `SELECT * FROM guild_${id} WHERE option = 'disconnect_timeout'`,
                )
                .get().value,
            ) +
            " seconds`",
        },
        {
          name: "**Lowest Instance Health**",
          value:
            "The bot will send a warning if trying to use an instance with health below this number.\nCurrent value: `" +
            settings
              .prepare(`SELECT * FROM guild_${id} WHERE option = 'min_health'`)
              .get().value +
            "`",
        },
      );
    await interaction.editReply({
      embeds: [settingsembed],
      components: [row],
    });
    if (owners.includes(interaction.user.id)) {
      const stats = new Discord.ButtonBuilder()
        .setCustomId(`stats`)
        .setLabel(`View stats`)
        .setStyle(ButtonStyle.Primary);
      const say = new Discord.ButtonBuilder()
        .setCustomId(`say`)
        .setLabel(`Send a message`)
        .setStyle(ButtonStyle.Primary);
      const guilds = new Discord.ButtonBuilder()
        .setCustomId(`gleave`)
        .setLabel(`Leave guilds`)
        .setStyle(ButtonStyle.Danger);
      const row = new Discord.ActionRowBuilder().addComponents(
        stats,
        say,
        guilds,
      );
      interaction.followUp({
        content:
          "These actions are potentially destructive. Proceed with caution.",
        components: [row],
        ephemeral: true,
      });
    }
  },
};
