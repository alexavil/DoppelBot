require('dotenv').config();

const fs = require("fs-extra");
const Discord = require("discord.js");
const cron = require("cron");
const token = process.env.TOKEN;
const debug_env = process.env.DOPPELBOT_DEBUG;
const debug = debug_env === "true";
const sqlite3 = require("better-sqlite3");
const InvidJS = require("@invidjs/invid-js");
const {
  PermissionsBitField,
  GatewayIntentBits,
  ButtonStyle,
  ChannelType,
} = require("discord.js");
const music = require("./music");

const client = new Discord.Client({
  intents: [
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
});

if (!fs.existsSync("./data/")) fs.mkdirSync("./data/");

const settings = new sqlite3("./data/settings.db");
const queue = new sqlite3("./data/queue.db");
const tags = new sqlite3("./data/tags.db");
const instances = new sqlite3("./data/instances_cache.db");

let eventcode = undefined;

client.commands = new Discord.Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const RequiredPerms = [
  [PermissionsBitField.Flags.ViewChannel, "View Channels"],
  [PermissionsBitField.Flags.ReadMessageHistory, "Read Message History"],
  [PermissionsBitField.Flags.SendMessages, "Send Messages"],
  [PermissionsBitField.Flags.ManageMessages, "Manage Messages"],
  [PermissionsBitField.Flags.Connect, "Connect"],
  [PermissionsBitField.Flags.Speak, "Speak"],
  [PermissionsBitField.Flags.AddReactions, "Add Reactions"],
];

let activities = undefined;

if (fs.existsSync("./activities.json")) {
  activities = fs.readJSONSync("./activities.json");
}

if (debug === true) {
  console.log("WARNING: DoppelBot is in debug mode!!!");
  console.log("Debug mode is intended to be used for testing purposes only.");
  console.log(
    "In this mode, DoppelBot will log most actions and commands, including sensitive information. We highly recommend redirecting the output to a file.",
  );
  console.log("This mode is not recommended for use in production.");
  console.log("Please proceed with caution.");
  console.log("[DEBUG] Retreived build hash successfully!");
  console.log(
    "[DEBUG] Build hash: " +
      require("child_process")
        .execSync("git rev-parse --short HEAD")
        .toString()
        .trim(),
  );
  console.log(
    `[DEBUG] InvidJS Version: ${
      require(".package-lock.json").packages["node_modules/@invidjs/invid-js"]
        .version
    }`,
  );
  client.on("debug", console.log);
  client.on("warn", console.log);
}

const Sentry = require("@sentry/node");
const { ProfilingIntegration } = require("@sentry/profiling-node");
const { getVoiceConnection } = require("@discordjs/voice");

let monitor = undefined;

function initSentry() {
  if (debug === true) console.log("[DEBUG] Initializing Sentry...");
  Sentry.init({
    dsn: "https://d7c06763ec24990c168e4ad0db91e360@o4504711913340928.ingest.sentry.io/4505981661151232",
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new ProfilingIntegration(),
    ],
    environment: debug ? "testing" : "production",
    release: require("./package.json").version
  });
  startMonitor();
}

function startMonitor() {
  if (monitor !== undefined) monitor.finish();
  monitor = Sentry.startTransaction({
    op: "transaction",
    name: "DoppelBot Performance",
  });
}

function gamecycle() {
  let games = activities.games;
  let gamestring = Math.floor(Math.random() * games.length);
  if (debug === true)
    console.log(`[DEBUG] Setting bot activity to ${games[gamestring]}...`);
  client.user.setActivity(games[gamestring]);
}

function getEvent() {
  eventcode = -1;
  console.log("[DEBUG] Validating event...")
  let date = new Date();
  if (date.getMonth() === 3 && date.getDate() === 1) {
    eventcode = 0;
    client.user.setAvatar(
      "./event/doppelbot_bday/avatar.png"
    );
  }
  if (date.getMonth() === 5 && date.getDate() === 11) {
    eventcode = 1;
    client.user.setUsername("KogasaBot");
    client.user.setAvatar(
      "./event/kogasa_bday/avatar.png"
    );
  }
  if (date.getMonth() === 5 && date.getDate() === 23) {
    eventcode = 2;
  }
  if (date.getMonth() === 6 && date.getDate() === 22) {
    eventcode = 3;
  }
  if (date.getMonth() === 7 && date.getDate() === 9) {
    eventcode = 4;
  }
  if (date.getMonth() === 9 && date.getDate() === 2) {
    eventcode = 5;
  }
  if (date.getMonth() === 9 && date.getDate() > 9 && date.getDate() <= 31) {
    console.log("[DEBUG] Halloween time!")
    eventcode = 6;
    client.user.setActivity("Happy Halloween, foolish mortals!");
  }
  if (eventcode === -1) {
    client.user.setUsername("DoppelBot");
    client.user.setAvatar(
      "./event/default_avatar.png"
    );
    if (activities !== undefined) {
      if (debug === true)
        console.log("[DEBUG] Activities file present, starting gamecycle job...");
      let job = new cron.CronJob("00 00 * * * *", gamecycle);
      job.start();
      gamecycle();
    }
  }
  settings
    .prepare(`UPDATE global SET value = ? WHERE option = ?`)
    .run(eventcode, "event_code");
}

function CheckForPerms() {
  if (debug === true)
    console.log("[DEBUG] Checking for permissions in every guild...");
  client.guilds.cache.forEach((guild) => {
    let id = guild.id;
    if (debug === true)
      console.log(`[DEBUG] Checking for permissions in guild ${id}...`);
    let notifs_value = settings
      .prepare(`SELECT * FROM guild_${id} WHERE option = 'notifications'`)
      .get().value;
    if (notifs_value === "false") {
      if (debug === true)
        console.log(
          `[DEBUG] Guild ${id} has notifications disabled. Skipping...`,
        );
      return false;
    }
    let botmember = guild.members.me;
    let guild_owner = guild.ownerId;
    let message = `The bot is missing the following permissions in ${guild.name}:\n\n`;
    let missing = 0;
    RequiredPerms.forEach((perm) => {
      if (!botmember.permissions.has(perm[0])) {
        if (debug === true)
          console.log(
            `[DEBUG] Guild ${id} is missing ${perm[1]}. Adding to message...`,
          );
        message += `${perm[1]}\n`;
        missing++;
      }
    });
    if (missing > 0) {
      if (debug === true)
        console.log(
          `[DEBUG] Guild ${id} is missing permissions, sending alert...`,
        );
      message += `\nPlease check your role and member settings!`;
      const outbtn = new Discord.ButtonBuilder()
        .setCustomId(`${guild.id}_opt-out`)
        .setLabel(`Opt-out of service notifications in ${guild.name}`)
        .setStyle(ButtonStyle.Danger);
      const row = new Discord.ActionRowBuilder().addComponents(outbtn);
      const embed = new Discord.EmbedBuilder()
        .setColor("RED")
        .setTitle("Alert!")
        .setDescription(message);
      client.users.cache
        .get(guild_owner)
        .send({ embeds: [embed], components: [row] })
        .catch((err) => {
          if (err.code === Discord.Constants.APIErrors.CANNOT_MESSAGE_USER) {
            if (debug === true)
              console.log(
                `[DEBUG] Cannot message owner of guild ${id}. Skipping...`,
              );
            return false;
          }
        });
    } else {
      if (debug === true)
        console.log(`[DEBUG] Guild ${id} has all permissions.`);
      return true;
    }
  });
}

function clearQueue(id) {
  if (debug === true)
    console.log(
      `[DEBUG] Bot has restarted, clearing queue and cache for guild ${id}...`,
    );
  queue.prepare(`DELETE FROM guild_${id}`).run();
}

function createConfig(id) {
  if (debug === true)
    console.log(`[DEBUG] Creating/validating config for guild ${id}...`);
  settings
    .prepare(
      `CREATE TABLE IF NOT EXISTS guild_${id} (option TEXT UNIQUE, value TEXT)`,
    )
    .run();
  let statement = settings.prepare(
    `INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`,
  );
  let transaction = settings.transaction(() => {
    statement.run("prefix", "d!");
    statement.run("notifications", "false");
    statement.run("disconnect_timeout", "30");
    statement.run("min_health", "75");
    statement.run("state", "commands");
    statement.run("music_mode", "queue");
  });
  transaction();
  queue
    .prepare(
      `CREATE TABLE IF NOT EXISTS guild_${id} (track TEXT, author TEXT, isLooped TEXT)`,
    )
    .run();
  tags
    .prepare(`CREATE TABLE IF NOT EXISTS guild_${id} (tag TEXT, response TEXT)`)
    .run();
}

function validateSettings() {
  if (debug === true) console.log("[DEBUG] Validating settings...");
  settings
  .prepare(
    `CREATE TABLE IF NOT EXISTS global (option TEXT UNIQUE, value INTEGER)`,
  )
  .run();  
settings.prepare(
    `INSERT OR IGNORE INTO global VALUES (?, ?)`,
  ).run("event_code", "-1");
  let tables = settings
    .prepare(`SELECT name FROM sqlite_schema WHERE type='table'`)
    .all();
  tables.forEach((row) => {
    if (row.name === "global") return false;
    let id = row.name.split("_")[1];
    if (!client.guilds.cache.has(id)) deleteConfig(id);
  });
}

function getInstances() {
  instances.prepare(`CREATE TABLE IF NOT EXISTS instances (url TEXT UNIQUE, api TEXT, health INTEGER)`).run();
  instances.prepare(`DELETE FROM instances`).run();
  let statement = instances.prepare(
    `INSERT OR IGNORE INTO instances VALUES (?, ?, ?)`,
  );
  InvidJS.fetchInstances({
    type: InvidJS.InstanceTypes.https,
    api_allowed: true
  }).then(result => {
    result.forEach(instance => {
      statement.run(instance.url, instance.api_allowed.toString(), instance.health)
    })
  })
}

function deleteConfig(id) {
  if (debug === true) console.log(`[DEBUG] Deleting config for guild ${id}...`);
  settings.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
  queue.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
  tags.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
}

function clearMusicCache() {
  if (debug === true) console.log("[DEBUG] Clearing music cache...");
  client.guilds.cache.forEach((guild) => {
    if (!getVoiceConnection(guild.id)) {
      if (debug === true)
        console.log(`[DEBUG] Clearing cache for guild ${guild.id}...`);
      music.clearCache(guild.id);
    }
  });
}

client.on("ready", () => {
  initSentry();
  validateSettings();
  getEvent();
  getInstances();
  let permcheck = new cron.CronJob("00 00 */8 * * *", CheckForPerms);
  permcheck.start();
  if (debug === true) console.log("[DEBUG] Running jobs for every guild...");
  client.guilds.cache.forEach((guild) => {
    createConfig(guild.id);
    clearQueue(guild.id);
    settings
      .prepare(`UPDATE guild_${guild.id} SET value = ? WHERE option = ?`)
      .run("commands", "state");
    settings
      .prepare(`UPDATE guild_${guild.id} SET value = ? WHERE option = ?`)
      .run("queue", "music_mode");
  });
  let eventcheck = new cron.CronJob("00 00 * * * *", getEvent);
  eventcheck.start();
  let instancecache = new cron.CronJob("00 00 * * * *", getInstances);
  instancecache.start();
  let monitorstart = new cron.CronJob("00 00 * * * *", startMonitor);
  monitorstart.start();
  let cacheclear = new cron.CronJob("00 00 00 * * *", clearMusicCache);
  cacheclear.start();
  if (debug === true) console.log("[DEBUG] Init jobs completed...");
  console.log("I am ready!");
});

client.on("guildCreate", (guild) => {
  if (debug === true)
    console.log(
      `[DEBUG] A new guild (${guild.id}) has been added, running jobs...`,
    );
  createConfig(guild.id);
});

client.on("guildDelete", (guild) => {
  if (debug === true)
    console.log(
      `[DEBUG] A guild (${guild.id}) has been removed, running jobs...`,
    );
  deleteConfig(guild.id);
});

client.on("interactionCreate", (interaction) => {
  if (interaction.customId.endsWith("opt-out")) {
    let id = interaction.customId.split("_")[0];
    if (debug === true)
      console.log(
        `[DEBUG] A guild ${guild.id} has switched service notifications off...`,
      );
    settings
      .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
      .run("false", "notifications");
    interaction.update({ components: [] });
    return interaction.channel.send(
      "Notifications are now disabled! You can re-enable them at any time using `d!notifications`.",
    );
  }
});

client.on("messageCreate", (message) => {
  if (!message.guild) return false;
  let id = message.guild.id;

  let responses = tags.prepare(`SELECT * FROM guild_${id}`).all();

  if (debug === true) console.log("[DEBUG] Message received...");

  responses.forEach((response) => {
    if (
      !message.author.bot &&
      message.content === response.tag &&
      settings.prepare(`SELECT * FROM guild_${id} WHERE option = 'state'`).get()
        .value === "commands"
    ) {
      if (debug === true) console.log("[DEBUG] Tag found, responding...");
      message.channel.send(response.response);
    }
  });

  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  let prefix = settings
    .prepare(`SELECT * FROM guild_${id} WHERE option = 'prefix'`)
    .get().value;

  if (message.author.bot && message.author.discriminator != "0000")
    return false;
  if (message.channel.type === ChannelType.DM) return false;
  const prefixRegex = new RegExp(
    `^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`,
  );
  if (!prefixRegex.test(message.content)) return false;

  const [, matchedPrefix] = message.content.match(prefixRegex);
  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName),
    );

  if (!command) return false;

  if (command.userpermissions) {
    const perms = message.channel.permissionsFor(message.author);
    if (!perms || !perms.has(command.userpermissions)) {
      if (debug === true)
        console.log(
          "[DEBUG] Attempted to execute command, but user has no permissions!",
        );
      return message.reply("You do not have permission to use this command!");
    }
  }

  try {
    if (
      settings.prepare(`SELECT * FROM guild_${id} WHERE option = 'state'`).get()
        .value === "commands"
    ) {
      if (debug === true)
        console.log(`[DEBUG] Trying to execute ${commandName} in ${id}...`);
      command.execute(message, args, client);
    }
  } catch (error) {
    if (debug === true) console.log("[DEBUG] Error: " + error.message);
    if (error.code === 50013) {
      return message.reply(
        "I don't have permissions to do that action! Check the Roles page!",
      );
    }
    Sentry.captureException(error);
    message.reply("There was an error trying to execute that command!");
  }
});

process.on("unhandledRejection", (error) => {
  if (debug === true) console.log("[DEBUG] Error: " + error.message);
  Sentry.captureException(error);
});

process.on("uncaughtException", (error) => {
  if (debug === true) console.log("[DEBUG] Error: " + error.message);
  Sentry.captureException(error);
});

process.on("SIGINT", () => {
  monitor.finish();
  console.log("Exiting...");
  process.exit();
})

client.login(token);

exports.debug = debug;
