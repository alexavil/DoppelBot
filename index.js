const fs = require("fs-extra");
const Discord = require("discord.js");
const cron = require("cron");
const token = process.env.TOKEN || process.argv[2];
const debug_env = process.env.DOPPELBOT_DEBUG;
const debug_string = process.argv[3];
const debug = debug_string === "debugmode" || debug_env === "true";
const sqlite3 = require("better-sqlite3");
const InvidJS = require("@invidjs/invid-js");
const {
  PermissionsBitField,
  GatewayIntentBits,
  ButtonStyle,
  ChannelType,
} = require("discord.js");
const child = require("child_process");

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

if (!fs.exists("./data/")) fs.mkdirSync("./data/");

const settings = new sqlite3("./data/settings.db");
const queue = new sqlite3("./data/queue.db");
const tags = new sqlite3("./data/tags.db");

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
    "In this mode, DoppelBot will log most actions and commands, including sensitive information. We highly recommend redirecting the output to a file."
  );
  console.log("This mode is not recommended for use in production.");
  console.log("Please proceed with caution.");
  client.on("debug", console.log);
  client.on("warn", console.log);
}

const Sentry = require("@sentry/node");

function initSentry() {
  if (debug === true) console.log("[DEBUG] Initializing Sentry...");
  Sentry.init({
    dsn: "https://546220d2015b4064a1c2363c6c6089f2@o4504711913340928.ingest.sentry.io/4504712612872192",
    tracesSampleRate: 1.0,
  });
}

function CheckForPerms() {
  if (debug === true)
    console.log("[DEBUG] Checking for permissions in every guild...");
  client.guilds.cache.forEach((guild) => {
    let id = guild.id;
    if (debug === true)
      console.log("[DEBUG] Checking for permissions in guild " + id + "...");
    let notifs_value = settings
      .prepare(`SELECT * FROM guild_${id} WHERE option = 'notifications'`)
      .get().value;
    if (notifs_value === "false") {
      if (debug === true)
        console.log(
          "[DEBUG] Guild " + id + " has notifications disabled. Skipping..."
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
            "[DEBUG] Guild " +
              id +
              " is missing " +
              perm[1] +
              ". Adding to message..."
          );
        message += `${perm[1]}\n`;
        missing++;
      }
    });
    if (missing > 0) {
      if (debug === true)
        console.log(
          "[DEBUG] Guild " + id + " is missing permissions, sending alert..."
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
                "[DEBUG] Cannot message owner of guild " + id + ". Skipping..."
              );
            return false;
          }
        });
    } else {
      if (debug === true)
        console.log("[DEBUG] Guild " + id + " has all permissions.");
      return true;
    }
  });
}

function clearQueue(id) {
  if (debug === true)
    console.log(
      "[DEBUG] Bot has restarted, clearing queue for guild " + id + "..."
    );
  queue.prepare(`DELETE FROM guild_${id}`).run();
}

function prepareGlobalSettings() {
  if (debug === true) console.log("[DEBUG] Validating global settings...");
  settings
    .prepare(
      `CREATE TABLE IF NOT EXISTS global (option TEXT UNIQUE, value TEXT)`
    )
    .run();
  tags
    .prepare(
      `CREATE TABLE IF NOT EXISTS global (tag TEXT UNIQUE, response TEXT)`
    )
    .run();
  settings
    .prepare(
      "insert or ignore into global (option, value) values ('current_version', '')"
    )
    .run();
  child.exec("git rev-parse --short HEAD", (err, stdout, stderr) => {
    if (err) {
      Sentry.captureException(err);
    } else {
      if (debug === true) {
        console.log("[DEBUG] Retreived build hash successfully!");
        console.log("[DEBUG] Build hash: " + stdout.toString().substring(0, 7));
        console.log(
          `[DEBUG] InvidJS Version: ${
            require(".package-lock.json").packages[
              "node_modules/@invidjs/invid-js"
            ].version
          }`
        );
      }
      settings
        .prepare("update global set value = ? where option = 'current_version'")
        .run(stdout.toString().substring(0, 7));
    }
  });
}

function createConfig(id) {
  if (debug === true)
    console.log("[DEBUG] Creating/validating config for guild " + id + "...");
  settings
    .prepare(
      `CREATE TABLE IF NOT EXISTS guild_${id} (option TEXT UNIQUE, value TEXT)`
    )
    .run();
  settings
    .prepare(`INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`)
    .run("prefix", "d!");
  settings
    .prepare(`INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`)
    .run("notifications", "false");
  settings
    .prepare(`INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`)
    .run("disconnect_timeout", "30");
  settings
    .prepare(`INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`)
    .run("default_instance", "");
  settings
    .prepare(`INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`)
    .run("min_health", "75");
  settings
    .prepare(`INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`)
    .run("state", "commands");
  queue
    .prepare(
      `CREATE TABLE IF NOT EXISTS guild_${id} (track TEXT, author TEXT, isLooped TEXT)`
    )
    .run();
  tags
    .prepare(`CREATE TABLE IF NOT EXISTS guild_${id} (tag TEXT, response TEXT)`)
    .run();
  let instance = settings
    .prepare(`SELECT * FROM guild_${id} WHERE option = 'default_instance'`)
    .get().value;
  if (instance === "") {
    if (debug === true)
      console.log(
        "[DEBUG] No instance defined for " + id + ", choosing one..."
      );
    getDefaultInstance(id);
  }
}

function getDefaultInstance(id) {
  InvidJS.fetchInstances({
    health: 99,
    api_allowed: true,
    limit: 1,
  }).then((result) => {
    settings
      .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
      .run(result[0].url, "default_instance");
  });
}

function validateSettings() {
  if (debug === true) console.log("[DEBUG] Validating settings...");
  let tables = settings
    .prepare(`SELECT name FROM sqlite_schema WHERE type='table'`)
    .all();
  tables.forEach((row) => {
    if (row.name === "global") return false;
    let id = row.name.split("_")[1];
    if (!client.guilds.cache.has(id)) deleteConfig(id);
  });
}

function deleteConfig(id) {
  if (debug === true)
    console.log("[DEBUG] Deleting config for guild " + id + "...");
  settings.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
  queue.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
  tags.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
}

function gamecycle() {
  let games = activities.games;
  let gamestring = Math.floor(Math.random() * games.length);
  if (debug === true)
    console.log("[DEBUG] Setting bot activity to " + games[gamestring] + "...");
  client.user.setActivity(games[gamestring]);
}

client.on("ready", () => {
  initSentry();
  prepareGlobalSettings();
  validateSettings();
  let permcheck = new cron.CronJob("00 00 */8 * * *", CheckForPerms);
  permcheck.start();
  if (debug === true) console.log("[DEBUG] Running jobs for every guild...");
  client.guilds.cache.forEach((guild) => {
    createConfig(guild.id);
    clearQueue(guild.id);
    settings
      .prepare(`UPDATE guild_${guild.id} SET value = ? WHERE option = ?`)
      .run("commands", "state");
  });
  if (activities !== undefined) {
    if (debug === true)
      console.log("[DEBUG] Activities file present, starting gamecycle job...");
    let job = new cron.CronJob("00 00 * * * *", gamecycle);
    job.start();
    gamecycle();
  }
  if (debug === true) console.log("[DEBUG] Init jobs completed...");
  console.log("I am ready!");
});

client.on("guildCreate", (guild) => {
  if (debug === true)
    console.log(
      "[DEBUG] A new guild " + guild.id + " has been added, running jobs..."
    );
  createConfig(guild.id);
});

client.on("guildDelete", (guild) => {
  if (debug === true)
    console.log(
      "[DEBUG] A guild " + guild.id + " has been removed, running jobs..."
    );
  deleteConfig(guild.id);
});

client.on("interactionCreate", (interaction) => {
  if (interaction.customId.endsWith("opt-out")) {
    let id = interaction.customId.split("_")[0];
    if (debug === true)
      console.log(
        "[DEBUG] A guild " +
          guild.id +
          " has switched service notifications off..."
      );
    settings
      .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
      .run("false", "notifications");
    interaction.update({ components: [] });
    return interaction.channel.send(
      "Notifications are now disabled! You can re-enable them at any time using `d!notifications`."
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
    `^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`
  );
  if (!prefixRegex.test(message.content)) return false;

  const [, matchedPrefix] = message.content.match(prefixRegex);
  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) return false;

  if (command.userpermissions) {
    const perms = message.channel.permissionsFor(message.author);
    if (!perms || !perms.has(command.userpermissions)) {
      if (debug === true)
        console.log(
          "[DEBUG] Attempted to execute command, but user has no permissions!"
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
        console.log(
          "[DEBUG] Trying to execute " + commandName + " in " + id + "..."
        );
      command.execute(message, args, client);
    }
  } catch (error) {
    if (debug === true) console.log("[DEBUG] Error: " + error.message);
    if (error.code === 50013) {
      return message.reply(
        "I don't have permissions to do that action! Check the Roles page!"
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

client.login(token);

exports.debug = debug;
