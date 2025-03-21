import "dotenv/config";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import fs from "fs-extra";
import util from "util";
import cron from "cron";
import path from "path";
import sqlite3 from "better-sqlite3";
import Discord from "discord.js";
import child from "child_process";
import {
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType,
} from "discord.js";

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { getVoiceConnection } from "@discordjs/voice";

let token = undefined;
let name = undefined;
let activities = undefined;

if (process.env.TOKEN) token = process.env.TOKEN;
else {
  console.error("Please provide a valid token!");
  process.exit();
}
if (process.env.NAME) name = process.env.NAME;
else {
  console.error("Please provide a valid username!");
  process.exit();
}
if (process.env.ACTIVITIES) activities = process.env.ACTIVITIES.split(",");

let debug = process.env.DEBUG;
let avatar = process.env.AVATAR;
let telemetry = process.env.TELEMETRY;

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
if (!fs.existsSync("./logs/")) fs.mkdirSync("./logs/");

const settings = new sqlite3("./data/settings.db");
const queue = new sqlite3("./data/queue.db");
const tags = new sqlite3("./data/tags.db");

client.commands = new Discord.Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const { default: command } = await import(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
      );
    }
  }
}

client.modals = new Discord.Collection();
const modalPath = path.join(__dirname, "modals");
const modalFiles = fs
  .readdirSync(modalPath)
  .filter((file) => file.endsWith(".js"));

for (const file of modalFiles) {
  const { default: modal } = await import(modalPath + "/" + file);
  if ("name" in modal && "execute" in modal) {
    client.modals.set(modal.name, modal);
  } else {
    console.log(
      `[WARNING] The modal at ${file} is missing a required "name" or "execute" property.`,
    );
  }
}

client.buttons = new Discord.Collection();
const buttonPath = path.join(__dirname, "buttons");
const buttonFiles = fs
  .readdirSync(buttonPath)
  .filter((file) => file.endsWith(".js"));

for (const file of buttonFiles) {
  const { default: button } = await import(buttonPath + "/" + file);
  if ("name" in button && "execute" in button) {
    client.buttons.set(button.name, button);
  } else {
    console.log(
      `[WARNING] The button at ${file} is missing a required "name" or "execute" property.`,
    );
  }
}

client.menus = new Discord.Collection();
const menuPath = path.join(__dirname, "menus");
const menuFiles = fs
  .readdirSync(menuPath)
  .filter((file) => file.endsWith(".js"));

for (const file of menuFiles) {
  const { default: menu } = await import(menuPath + "/" + file);
  if ("name" in menu && "execute" in menu) {
    client.menus.set(menu.name, menu);
  } else {
    console.log(
      `[WARNING] The menu at ${file} is missing a required "name" or "execute" property.`,
    );
  }
}

const RequiredPerms = [
  [PermissionsBitField.Flags.ViewChannel, "View Channels"],
  [PermissionsBitField.Flags.ReadMessageHistory, "Read Message History"],
  [PermissionsBitField.Flags.SendMessages, "Send Messages"],
  [PermissionsBitField.Flags.ManageMessages, "Manage Messages"],
  [PermissionsBitField.Flags.Connect, "Connect"],
  [PermissionsBitField.Flags.Speak, "Speak"],
];

if (debug === "true") {
  const log_file = fs.createWriteStream(__dirname + "/logs/debug.log", {
    flags: "a",
  });
  const log_stdout = process.stdout;

  console.log = function (d) {
    //
    log_file.write(
      new Date().toLocaleString() + " --- " + util.format(d) + "\n",
    );
    log_stdout.write(util.format(d) + "\n");
  };

  console.log(`WARNING: ${name} is in debug mode! 
  Debug mode is intended to be used for testing purposes only. 
  In this mode, ${name} will log most actions and commands, including sensitive information. 
  We highly recommend redirecting the output to a file. 
  This mode is not recommended for use in production. Please proceed with caution.`);
  console.log(
    "[DEBUG] Build hash: " +
      child.execSync("git rev-parse --short HEAD").toString().trim(),
  );
  client.on("debug", console.log);
  client.on("warn", console.log);
}

function setProfile() {
  if (client.user.username !== name && name !== undefined)
    client.user.setUsername(name);
  if (client.user.avatar !== avatar && avatar !== undefined)
    client.user.setAvatar(avatar);
}

function initSentry() {
  if (debug === "true") console.log("[DEBUG] Initializing Sentry...");
  Sentry.init({
    dsn: "https://3f2f508f31b53efc75cf35eda503e49b@o4505970900467712.ingest.us.sentry.io/4509011809796097",
    integrations: [
      nodeProfilingIntegration(),
    ],
    // Tracing
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    environment: debug ? "testing" : "production",
    release: "3.0"
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
          console.log(`[DEBUG] Guild ${id} is missing ${perm[1]}.`);
        message += `${perm[1]}\n`;
        missing++;
      }
    });
    if (missing > 0) {
      if (debug === "true")
        console.log(`[DEBUG] Sending permissions alert for guild ${id}...`);
      message += `\nPlease check your role and member settings!`;
      const notifbtn = new Discord.ButtonBuilder()
        .setCustomId(`notifications`)
        .setLabel(`Toggle service notifications in ${guild.name}`)
        .setStyle(Discord.ButtonStyle.Primary);
      const row = new Discord.ActionRowBuilder().addComponents(notifbtn);
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
    statement.run("notifications", "false");
    statement.run("disconnect_timeout", "30");
    statement.run("fail_threshold", "10");
  });
  transaction();
  queue
    .prepare(
      `CREATE TABLE IF NOT EXISTS guild_${id} (track TEXT, name TEXT, author TEXT, isLooped TEXT)`,
    )
    .run();
  tags
    .prepare(`CREATE TABLE IF NOT EXISTS guild_${id} (tag TEXT, response TEXT)`)
    .run();
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
  if (debug === "true")
    console.log(`[DEBUG] Deleting config for guild ${id}...`);
  settings.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
  queue.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
  tags.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
}

function editActivity() {
  let gamestring = Math.floor(Math.random() * activities.length);
  if (debug === "true") console.log(`[DEBUG] Editing bot activity...`);
  client.user.setActivity(activities[gamestring]);
}

client.on("ready", () => {
  if (telemetry === "true" || debug === "true") initSentry();
  setProfile();
  validateSettings();
  let permcheck = new cron.CronJob("00 00 */8 * * *", CheckForPerms);
  permcheck.start();
  if (debug === "true") console.log("[DEBUG] Running jobs for every guild...");
  client.guilds.cache.forEach((guild) => {
    createConfig(guild.id);
    clearQueue(guild.id);
  });
  if (activities !== undefined) {
    let job = new cron.CronJob("00 00 * * * *", editActivity);
    job.start();
    editActivity();
  }
  if (debug === "true") console.log("[DEBUG] Jobs completed...");
  console.log("I am ready!");
});

client.on("guildCreate", (guild) => {
  if (debug === "true")
    console.log(`[DEBUG] A new guild (${guild.id}) has been added!`);
  createConfig(guild.id);
});

client.on("guildDelete", (guild) => {
  if (debug === "true")
    console.log(`[DEBUG] A guild (${guild.id}) has been removed!`);
  deleteConfig(guild.id);
});

client.on("interactionCreate", async (interaction) => {
  let id = interaction.guild.id;
  let monitor = undefined;
  if (telemetry === "true" || debug === "true")
    monitor = Sentry.startInactiveSpan({
      op: "transaction",
      name: `DoppelBot Performance - ${interaction.id} (${interaction.guildId} - ${interaction.channelId})`,
    });

  if (interaction.isModalSubmit()) {
    const modal = interaction.client.modals.get(interaction.customId);

    try {
      if (debug === "true")
        console.log(
          `[DEBUG] Trying to execute ${interaction.customId} in ${id}.`,
        );
      modal.execute(interaction);
      if (monitor !== undefined) return monitor.end();
      else return;
    } catch (error) {
      if (telemetry === "true" || debug === "true") Sentry.captureException(error);
      if (debug === "true") console.log("[DEBUG] Error: " + error.message);
      return;
    }
  }

  if (interaction.isButton()) {
    const button = interaction.client.buttons.get(interaction.customId);

    try {
      if (debug === "true")
        console.log(
          `[DEBUG] Trying to execute ${interaction.customId} in ${id}.`,
        );
      button.execute(interaction);
      if (monitor !== undefined) return monitor.end();
      else return;
    } catch (error) {
      if (telemetry === "true" || debug === "true") Sentry.captureException(error);
      if (debug === "true") console.log("[DEBUG] Error: " + error.message);
      return;
    }
  }

  if (interaction.isAnySelectMenu()) {
    const menu = interaction.client.menus.get(interaction.customId);

    try {
      if (debug === "true")
        console.log(
          `[DEBUG] Trying to execute ${interaction.customId} in ${id}.`,
        );
      menu.execute(interaction);
      if (monitor !== undefined) return monitor.end();
      else return;
    } catch (error) {
      if (telemetry === "true" || debug === "true") Sentry.captureException(error);
      if (debug === "true") console.log("[DEBUG] Error: " + error.message);
      return;
    }
  }
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    if (debug === "true")
      console.log(
        `[DEBUG] Trying to execute ${interaction.commandName} in ${id}.`,
      );
    if (command.shouldWait !== false)
      await interaction.deferReply({ flags: Discord.MessageFlags.Ephemeral });
    await command.execute(interaction);
    if (monitor !== undefined) return monitor.end();
    else return;
  } catch (error) {
    if (telemetry === "true" || debug === "true") Sentry.captureException(error);
    if (debug === "true") console.log("[DEBUG] Error: " + error.message);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "uhh can u say that again?",
        flags: Discord.MessageFlags.Ephemeral,
      });
    } else {
      await interaction.editReply({
        content: "uhh can u say that again?",
        flags: Discord.MessageFlags.Ephemeral,
      });
    }
  }
});

client.on("messageCreate", (message) => {
  if (!message.guild) return false;
  let id = message.guild.id;

  let custom_tags = tags.prepare(`SELECT * FROM guild_${id}`).all();

  if (debug === "true") console.log("[DEBUG] Got a message!");

  let monitor = undefined;

  custom_tags.forEach((tag) => {
    if (!message.author.bot && message.content === tag.tag) {
      if (debug === "true") console.log("[DEBUG] Tag found!");
      if (telemetry === "true" || debug === "true") {
        monitor = Sentry.startInactiveSpan({
          op: "transaction",
          name: `DoppelBot Performance - ${message.id} (${id} - ${message.channel.id})`,
        });
      }
      let responses = tag.response.split("---\n");
      message.channel.send(
        responses[Math.floor(Math.random() * responses.length)],
      );
      if (monitor !== undefined) monitor.end();
    }
  });

  if (message.author.bot && message.author.discriminator != "0000")
    return false;
  if (message.channel.type === ChannelType.DM) return false;
});

process.on("unhandledRejection", (error) => {
  if (debug === "true") console.log("[DEBUG] Error: " + error.message);
  if (telemetry === "true" || debug === "true") Sentry.captureException(error);
});

process.on("uncaughtException", (error) => {
  if (debug === "true") console.log("[DEBUG] Error: " + error.message);
  if (telemetry === "true" || debug === "true") Sentry.captureException(error);
});

process.on("SIGINT", () => {
  console.log("Exiting...");
  process.exit();
});

client.login(token);
