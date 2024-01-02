import Discord from "discord.js";
import sqlite3 from "better-sqlite3";
const name = process.env.NAME;
export default {
  name: "adminhelp",
  aliases: ["ahelp", "adm", "admhelp"],
  description: "About the bot",
  userpermissions: Discord.PermissionsBitField.Flags.BanMembers,
  execute(message) {
    const settings = new sqlite3("./data/settings.db");
    let id = message.guild.id;
    let prefix = settings
      .prepare(`SELECT value FROM guild_${id} WHERE option = 'prefix'`)
      .get().value;
    const help = new Discord.EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`${name} Admin Help`)
      .addFields(
        {
          name: "Service commands",
          value: `\`${prefix}settings\` - bring up the settings panel
          \`${prefix}notifications\` - toggle service notifications
          \`${prefix}prefix\` - change the guild prefix
          \`${prefix}settimeout\` - set VC disconnect timeout (in seconds)
          \`${prefix}sethealth\` - set minimum Invidious instance health`,
        },
        {
          name: "Tags",
          value: `All tags commands start with ${prefix}tags.
          \`create\` - create a tag
          \`delete\` - delete a tag
            \`list\` - see all tags.`,
        },
      );
    message.channel.send({ embeds: [help] });
  },
};
