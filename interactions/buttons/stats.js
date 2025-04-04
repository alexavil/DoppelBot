import child from "child_process";
import Discord from "discord.js";
import fs from "fs-extra";
import os from "os";
import { convertToString } from "../../utils/TimeConverter.js";
const name = process.env.NAME;

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
            \`\`\`js
Commit: ${commit}
OS: ${os.type()} ${os.release} ${os.arch}
Node Version: ${process.version}
Discord.js Version: ${Discord.version}
Available RAM: ${Math.round(
            os.freemem() / 1024 / 1024,
          )} / ${Math.round(os.totalmem() / 1024 / 1024)} MB,
CPU: ${os.cpus()[0].model}
CPU Usage: ${os.loadavg()[0].toFixed(2)}%
Free Disk Space: ${Math.round(
            (fs.statfsSync(__dirname).bfree / fs.statfsSync(__dirname).blocks) *
              100,
          )}%
Bot Uptime: ${convertToString(process.uptime())}
OS Uptime: ${convertToString(os.uptime())}\`\`\``,
        },
        {
          name: "Bot Stats",
          value: `\`\`\`js
Total Servers: ${Array.from(interaction.client.guilds.cache).length}
Total Users: ${Array.from(interaction.client.users.cache).length}
WebSocket Ping: ${interaction.client.ws.ping}ms.\`\`\``,
        },
      );
    interaction.update({
      embeds: [stats],
      components: [],
      flags: Discord.MessageFlags.Ephemeral,
    });
  },
};
