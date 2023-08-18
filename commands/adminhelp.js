const Discord = require("discord.js");
const sqlite3 = require("better-sqlite3");
const debug = require("../index");
const os = require("os");
module.exports = {
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
    let version = settings
      .prepare(`SELECT value FROM global WHERE option = 'current_version'`)
      .get().value;
    const help = new Discord.EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Hi, I'm DoppelBot! :heart:")
      .addFields(
        {
          name: "Service commands",
          value: `\`${prefix}settings\` - bring up the settings panel
          \`${prefix}notifications\` - toggle service notifications
          \`${prefix}prefix\` - change the guild prefix
          \`${prefix}settimeout\` - set VC disconnect timeout (in seconds)
          \`${prefix}setinstance\` - set default Invidious instance
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
