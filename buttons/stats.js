import Discord from "discord.js";
import child from "child_process";
const name = process.env.NAME;
import os from "os";
export default {
  name: "stats",
  async execute(interaction) {
    let commit = child.execSync("git rev-parse --short HEAD").toString().trim();
    const stats = new Discord.EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`${name} Stats`)
      .addFields(
        {
          name: "System Information",
          value: `
            Commit: \`${commit}\`
            OS: \`${os.type()} ${os.release} ${os.arch}\`
            Node Version: \`${process.version}\`
            Discord.js Version: \`${Discord.version}\`
            Available RAM: \`${Math.round(
              os.freemem() / 1024 / 1024,
            )} / ${Math.round(os.totalmem() / 1024 / 1024)} MB\`,
            CPU: \`${os.cpus()[0].model}\`
            CPU Usage: \`${os.loadavg()[0].toFixed(2)}%\``,
        },
        {
          name: "Bot Stats",
          value: `Total servers: \`${Array.from(interaction.client.guilds.cache).length}\`
          Total users: \`${Array.from(interaction.client.users.cache).length}\``,
        },
      );
    interaction.reply({ embeds: [stats], ephemeral: true });
  },
};
