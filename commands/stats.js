import Discord from "discord.js";
import * as InvidJS from "@invidjs/invid-js";
import sqlite3 from "better-sqlite3";
import child from "child_process";
const debug = process.env.DEBUG;
const owners = process.env.OWNERS;
import os from "os";
export default {
  name: "stats",
  description: "Show stats",
  async execute(message, args, client) {
    if (
      !owners.includes(message.author.id)
    )
      return false;
    const settings = new sqlite3("./data/settings.db");
    let id = message.guild.id;
    let default_instance = settings
      .prepare(
        `SELECT value FROM guild_${id} WHERE option = 'default_instance'`,
      )
      .get().value;
    let instance = await InvidJS.fetchInstances({ url: default_instance });
    let commit = child.execSync("git rev-parse --short HEAD").toString().trim();
    const stats = new Discord.EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("DoppelBot Stats")
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
          value: `Total servers: \`${Array.from(client.guilds.cache).length}\`
          Total users: \`${Array.from(client.users.cache).length}\``,
        },
      );
    message.channel.send({ embeds: [stats] });
  },
};
