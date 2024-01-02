import "dotenv/config";

import fs from "fs-extra";
import cron from "cron";
import sqlite3 from "better-sqlite3";
import Discord from "discord.js";
import child from "child_process";
import { GatewayIntentBits, PermissionsBitField, ChannelType } from "discord.js";
import * as InvidJS from "@invidjs/invid-js";

import Sentry from "@sentry/node";

const token = process.env.TOKEN;
const debug = process.env.DEBUG;

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

client.commands = new Discord.Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const { default: command } = await import(`./commands/${file}`);
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

if (debug === "true") {
  console.log(`WARNING: DoppelBot is in debug mode! 
  Debug mode is intended to be used for testing purposes only. 
  In this mode, DoppelBot will log most actions and commands, including sensitive information. 
  We highly recommend redirecting the output to a file. 
  This mode is not recommended for use in production. Please proceed with caution.`);
  console.log(
    "[DEBUG] Build hash: " +
      child.execSync("git rev-parse --short HEAD").toString().trim(),
  );
  client.on("debug", console.log);
  client.on("warn", console.log);
}

function initSentry() {
  if (debug === "true") console.log("[DEBUG] Initializing Sentry...");
  Sentry.init({
    dsn: "https://546220d2015b4064a1c2363c6c6089f2@o4504711913340928.ingest.sentry.io/4504712612872192",
    tracesSampleRate: 1.0,
    environment: debug ? "testing" : "production",
  });
}

function CheckForPerms() {
  client.guilds.cache.forEach((guild) => {
    let id = guild.id;
    if (debug === "true")
      console.log(`[DEBUG] Checking for permissions in guild ${id}...`);
    let notifs_value = settings
      .prepare(`SELECT * FROM guild_${id} WHERE option = 'notifications'`)
      .get().value;
    if (notifs_value === "false") {
      if (debug === "true")
        console.log(
          `[DEBUG] Guild ${id} has notifications disabled. Message will not be sent.`,
        );
      return false;
    }
    let botmember = guild.members.me;
    let guild_owner = guild.ownerId;
    let message = `The bot is missing the following permissions in ${guild.name}:\n\n`;
    let missing = 0;
    RequiredPerms.forEach((perm) => {
      if (!botmember.permissions.has(perm[0])) {
        if (debug === "true")
          console.log(
            `[DEBUG] Guild ${id} is missing ${perm[1]}.`,
          );
        message += `${perm[1]}\n`;
        missing++;
      }
    });
    if (missing > 0) {
      if (debug === "true")
        console.log(
          `[DEBUG] Sending permissions alert for guild ${id}...`,
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
            if (debug === "true")
              console.log(
                `[DEBUG] Cannot message owner of guild ${id}. Message will not be sent.`,
              );
            return false;
          }
        });
    } else {
      if (debug === "true")
        console.log(`[DEBUG] Guild ${id} has all required permissions.`);
      return true;
    }
  });
}

function clearQueue(id) {
  if (debug === "true")
    console.log(`[DEBUG] Bot has restarted, clearing queue for guild ${id}.`);
  queue.prepare(`DELETE FROM guild_${id}`).run();
}

function createConfig(id) {
  if (debug === "true")
    console.log(`[DEBUG] Creating/validating config for guild ${id}.`);
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
    statement.run("default_instance", "");
    statement.run("min_health", "75");
    statement.run("state", "commands");
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
  let instance = settings
    .prepare(`SELECT * FROM guild_${id} WHERE option = 'default_instance'`)
    .get().value;
  if (instance === "") {
    if (debug === "true")
      console.log(`[DEBUG] Selecting the best Invidious instance for guild ${id}...`);
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
  if (debug === "true") console.log("[DEBUG] Validating settings...");
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
  if (debug === "true") console.log(`[DEBUG] Deleting config for guild ${id}...`);
  settings.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
  queue.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
  tags.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
}

function gamecycle() {
  let games = activities.games;
  let gamestring = Math.floor(Math.random() * games.length);
  if (debug === "true")
    console.log(`[DEBUG] Setting bot activity to ${games[gamestring]}...`);
  client.user.setActivity(games[gamestring]);
}

client.on("ready", () => {
  initSentry();
  validateSettings();
  let permcheck = new cron.CronJob("00 00 */8 * * *", CheckForPerms);
  permcheck.start();
  if (debug === "true") console.log("[DEBUG] Running jobs for every guild...");
  client.guilds.cache.forEach((guild) => {
    createConfig(guild.id);
    clearQueue(guild.id);
    settings
      .prepare(`UPDATE guild_${guild.id} SET value = ? WHERE option = ?`)
      .run("commands", "state");
  });
  if (activities !== undefined) {
    if (debug === "true")
      console.log("[DEBUG] Activities file present, starting gamecycle job...");
    let job = new cron.CronJob("00 00 * * * *", gamecycle);
    job.start();
    gamecycle();
  }
  if (debug === "true") console.log("[DEBUG] Jobs completed...");
  console.log("I am ready!");
});

client.on("guildCreate", (guild) => {
  if (debug === "true")
    console.log(
      `[DEBUG] A new guild (${guild.id}) has been added!`,
    );
  createConfig(guild.id);
});

client.on("guildDelete", (guild) => {
  if (debug === "true")
    console.log(
      `[DEBUG] A guild (${guild.id}) has been removed!`,
    );
  deleteConfig(guild.id);
});

client.on("interactionCreate", (interaction) => {
  if (interaction.customId.endsWith("opt-out")) {
    let id = interaction.customId.split("_")[0];
    if (debug === "true")
      console.log(
        `[DEBUG] A guild (${guild.id}) has switched service notifications off.`,
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

  if (debug === "true") console.log("[DEBUG] Got a message!");

  responses.forEach((response) => {
    if (
      !message.author.bot &&
      message.content === response.tag &&
      settings.prepare(`SELECT * FROM guild_${id} WHERE option = 'state'`).get()
        .value === "commands"
    ) {
      if (debug === "true") console.log("[DEBUG] Tag found!");
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
      if (debug === "true")
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
      if (debug === "true")
        console.log(`[DEBUG] Trying to execute ${commandName} in ${id}...`);
      command.execute(message, args, client);
    }
  } catch (error) {
    if (debug === "true") console.log("[DEBUG] Error: " + error.message);
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
  if (debug === "true") console.log("[DEBUG] Error: " + error.message);
  Sentry.captureException(error);
});

process.on("uncaughtException", (error) => {
  if (debug === "true") console.log("[DEBUG] Error: " + error.message);
  Sentry.captureException(error);
});

client.login(token);
