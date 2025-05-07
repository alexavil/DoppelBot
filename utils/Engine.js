import Discord from "discord.js";
import child from "child_process";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import util from "util";
import fs from "fs-extra";

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
  debugLog: function (str) {
    return undefined;
  },
  reportError: function (id) {
    return undefined;
  },
  monitorPerformance: function (str) {
    return undefined;
  },
};

switch (engine.debug) {
  case "true": {
    const log_file = fs.createWriteStream(process.cwd() + "/logs/debug.log", {
      flags: "a",
    });
    const log_stdout = process.stdout;
    engine.debugLog = (str) => {
      let msg = "[DEBUG] " + str;
      log_file.write(
        new Date().toLocaleString() + " --- " + util.format(msg) + "\n",
      );
      log_stdout.write(util.format(msg) + "\n");
    };
    break;
  }
  case "false":
  default: {
    engine.debugLog = (str) => {
      return undefined;
    };
    break;
  }
}

if (engine.debug === "true" || engine.telemetry === "true") {
  engine.debugLog("Activating Sentry...");
  Sentry.init({
    dsn: "https://3f2f508f31b53efc75cf35eda503e49b@o4505970900467712.ingest.us.sentry.io/4509011809796097",
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    environment: engine.debug ? "testing" : "production",
    release: engine.build_hash,
  });
  engine.reportError = (str) => {
    Sentry.captureException(str);
  };
  engine.monitorPerformance = (id) => {
    let perf = Sentry.startInactiveSpan({
      op: "transaction",
      name: `${engine.name} Performance - ${id}`,
    });
    return perf;
  };
} else {
  engine.reportError = (str) => {
    return undefined;
  };
  engine.monitorPerformance = (id) => {
    return undefined;
  };
}

export default engine;
