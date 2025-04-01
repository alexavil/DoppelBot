import sqlite3 from "better-sqlite3";
import Discord, { ButtonStyle } from "discord.js";
const settings = new sqlite3("./data/settings.db");
let owners;
if (process.env.OWNERS) owners = process.env.OWNERS.split(",");

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
/*    const errorsbtn = new Discord.ButtonBuilder()
      .setCustomId(`setfails`)
      .setLabel(`Set error threshold`)
      .setStyle(ButtonStyle.Primary);
*/
    const timeoutbtn = new Discord.ButtonBuilder()
      .setCustomId(`settimeout`)
      .setLabel(`Set VC timeout`)
      .setStyle(ButtonStyle.Primary);
    const defaultbtn = new Discord.ButtonBuilder()
      .setCustomId(`defaults`)
      .setLabel(`Reset to defaults`)
      .setStyle(ButtonStyle.Danger);
    const adminrow = new Discord.ActionRowBuilder().addComponents(
      notifbtn,
      //errorsbtn,
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
        }
      );
    if (owners !== undefined && owners.includes(interaction.user.id)) {
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
      const cache = new Discord.ButtonBuilder()
        .setCustomId(`clear_cache`)
        .setLabel(`Clear music cache`)
        .setStyle(ButtonStyle.Danger);
      const ownerrow = new Discord.ActionRowBuilder().addComponents(
        stats,
        say,
        guilds,
        cache,
      );
      await interaction.editReply({
        embeds: [settingsembed],
        components: [adminrow, ownerrow],
      });
    } else {
      await interaction.editReply({
        embeds: [settingsembed],
        components: [adminrow],
      });
    }
  },
};
