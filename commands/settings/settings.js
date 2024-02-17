import Discord, { ButtonStyle } from "discord.js";
import sqlite3 from "better-sqlite3";
const settings = new sqlite3("./data/settings.db");
const debug = process.env.DEBUG;
const owners = process.env.OWNERS;
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
    const backupbtn = new Discord.ButtonBuilder()
      .setCustomId(`backup`)
      .setLabel(`Create a backup`)
      .setStyle(ButtonStyle.Primary);
    const restorebtn = new Discord.ButtonBuilder()
      .setCustomId(`restore`)
      .setLabel(`Restore from a backup`)
      .setStyle(ButtonStyle.Danger);
    const defaultbtn = new Discord.ButtonBuilder()
      .setCustomId(`defaults`)
      .setLabel(`Reset to defaults`)
      .setStyle(ButtonStyle.Danger);
    const healthbtn = new Discord.ButtonBuilder()
      .setCustomId(`sethealth`)
      .setLabel(`Invidious: Set Health`)
      .setStyle(ButtonStyle.Primary);
    const timeoutbtn = new Discord.ButtonBuilder()
      .setCustomId(`settimeout`)
      .setLabel(`Set VC timeout`)
      .setStyle(ButtonStyle.Primary);
    const addtag = new Discord.ButtonBuilder()
      .setCustomId(`tagcreate`)
      .setLabel(`Create a tag`)
      .setStyle(ButtonStyle.Primary);
    const deltag = new Discord.ButtonBuilder()
      .setCustomId(`tagdelete`)
      .setLabel(`Delete a tag`)
      .setStyle(ButtonStyle.Primary);
    const row1 = new Discord.ActionRowBuilder().addComponents(
      backupbtn,
      restorebtn,
      defaultbtn,
    );
    const row2 = new Discord.ActionRowBuilder().addComponents(notifbtn);
    const row3 = new Discord.ActionRowBuilder().addComponents(
      healthbtn,
      timeoutbtn,
    );
    const row4 = new Discord.ActionRowBuilder().addComponents(addtag, deltag);
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
      components: [row1, row2, row3, row4],
    });
    if (owners.includes(interaction.user.id)) {
      const stats = new Discord.ButtonBuilder()
        .setCustomId(`stats`)
        .setLabel(`View stats`)
        .setStyle(ButtonStyle.Primary);
      const guilds = new Discord.ButtonBuilder()
        .setCustomId(`gleave`)
        .setLabel(`Leave guilds`)
        .setStyle(ButtonStyle.Danger);
      const say = new Discord.ButtonBuilder()
        .setCustomId(`say`)
        .setLabel(`Send a message`)
        .setStyle(ButtonStyle.Primary);
      const row = new Discord.ActionRowBuilder().addComponents(
        stats,
        guilds,
        say,
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
