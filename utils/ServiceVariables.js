import Discord from "discord.js";
import child from "child_process";

const engine = {
  intents: [
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildMessageReactions,
    Discord.GatewayIntentBits.GuildMessageTyping,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.GuildPresences,
    Discord.GatewayIntentBits.GuildVoiceStates,
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.MessageContent,
  ],
  perms: [
    Discord.PermissionsBitField.Flags.ViewChannel,
    Discord.PermissionsBitField.Flags.ReadMessageHistory,
    Discord.PermissionsBitField.Flags.SendMessages,
    Discord.PermissionsBitField.Flags.ManageMessages,
    Discord.PermissionsBitField.Flags.Connect,
    Discord.PermissionsBitField.Flags.Speak,
  ],
  dataFolder: `${process.cwd()}/data/`,
  logsFolder: `${process.cwd()}/logs/`,
  cacheFolder: `${process.cwd()}/cache/`,
  buttonsFolder: `${process.cwd()}/interactions/buttons/`,
  commandsFolder: `${process.cwd()}/interactions/commands/`,
  menusFolder: `${process.cwd()}/interactions/menus/`,
  modalsFolder: `${process.cwd()}/interactions/modals/`,
  settingsDB: `settings.db`,
  queueDB: `queue.db`,
  tagsDB: `tags.db`,
  cacheDB: `cache.db`,
  token: process.env.TOKEN,
  name: process.env.NAME,
  client_id: process.env.CLIENT_ID,
  owners: process.env.OWNERS.split(","),
  avatar: process.env.AVATAR,
  activities: process.env.ACTIVITIES.split(","),
  telemetry: process.env.TELEMETRY,
  debug: process.env.DEBUG,
  build_hash: child.execSync("git rev-parse --short HEAD").toString().trim(),
}

export default engine;
