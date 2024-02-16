import "dotenv/config";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import fs from "fs-extra";
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
import * as InvidJS from "@invidjs/invid-js";

import Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import { getVoiceConnection } from "@discordjs/voice";

let monitor = undefined;

const token = process.env.TOKEN;
const debug = process.env.DEBUG;
const activities = process.env.ACTIVITIES.split(",");
const name = process.env.NAME;
const avatar = process.env.AVATAR;

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
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

client.modals = new Discord.Collection();
const modalPath = path.join(__dirname, "modals");
const modalFiles = fs.readdirSync(modalPath).filter((file) => file.endsWith(".js"));

for (const file of modalFiles) {
    const { default: modal } = await import(modalPath + "/" + file);
    if ("name" in modal && "execute" in modal) {
      client.modals.set(modal.name, modal);
    } else {
      console.log(
        `[WARNING] The modal at ${file} is missing a required "name" or "execute" property.`
      );
    }
}

client.buttons = new Discord.Collection();
const buttonPath = path.join(__dirname, "buttons");
const buttonFiles = fs.readdirSync(buttonPath).filter((file) => file.endsWith(".js"));

for (const file of buttonFiles) {
    const { default: button } = await import(buttonPath + "/" + file);
    if ("name" in button && "execute" in button) {
      client.buttons.set(button.name, button);
    } else {
      console.log(
        `[WARNING] The button at ${file} is missing a required "name" or "execute" property.`
      );
    }
}

client.menus = new Discord.Collection();
const menuPath = path.join(__dirname, "menus");
const menuFiles = fs.readdirSync(menuPath).filter((file) => file.endsWith(".js"));

for (const file of menuFiles) {
    const { default: menu } = await import(menuPath + "/" + file);
    if ("name" in menu && "execute" in menu) {
      client.menus.set(menu.name, menu);
    } else {
      console.log(
        `[WARNING] The menu at ${file} is missing a required "name" or "execute" property.`
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
  [PermissionsBitField.Flags.AddReactions, "Add Reactions"],
];

if (debug === "true") {
  console.log(`WARNING: ${name} is in debug mode! 
  Debug mode is intended to be used for testing purposes only. 
  In this mode, ${name} will log most actions and commands, including sensitive information. 
  We highly recommend redirecting the output to a file. 
  This mode is not recommended for use in production. Please proceed with caution.`);
  console.log(
    "[DEBUG] Build hash: " +
      child.execSync("git rev-parse --short HEAD").toString().trim()
  );
  client.on("debug", console.log);
  client.on("warn", console.log);
}

function setProfile() {
  if (client.user.username !== name) client.user.setUsername(name);
  if (client.user.avatar !== avatar) client.user.setAvatar(avatar);
}

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
    release: "3.0"
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
          `[DEBUG] Guild ${id} has notifications disabled. Message will not be sent.`
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
                `[DEBUG] Cannot message owner of guild ${id}. Message will not be sent.`
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
      `CREATE TABLE IF NOT EXISTS guild_${id} (option TEXT UNIQUE, value TEXT)`
    )
    .run();
  let statement = settings.prepare(
    `INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`
  );
  let transaction = settings.transaction(() => {
    statement.run("notifications", "false");
    statement.run("disconnect_timeout", "30");
    statement.run("min_health", "75");
    statement.run("state", "commands");
  });
  transaction();
  queue
    .prepare(
      `CREATE TABLE IF NOT EXISTS guild_${id} (track TEXT, author TEXT, isLooped TEXT)`
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

function gamecycle() {
  let gamestring = Math.floor(Math.random() * activities.length);
  if (debug === "true") console.log(`[DEBUG] Editing bot activity...`);
  client.user.setActivity(activities[gamestring]);
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
  setProfile();
  validateSettings();
  getInstances();
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
    let job = new cron.CronJob("00 00 * * * *", gamecycle);
    job.start();
    gamecycle();
  }
  let cacheclear = new cron.CronJob("00 00 00 * * *", clearMusicCache);
  cacheclear.start();
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
  await interaction.deferReply( {ephemeral: true} );

  if (interaction.isModalSubmit()) {
    const modal = interaction.client.modals.get(interaction.customId);

    try {
      return modal.execute(interaction);
    } catch (error) {
      console.error(error);
    }
  }

  if (interaction.isButton()) {
    const button = interaction.client.buttons.get(interaction.customId);

    try {
      return button.execute(interaction);
    } catch (error) {
      console.error(error);
    }
  }

  if (interaction.isAnySelectMenu()) {
    const menu = interaction.client.menus.get(interaction.customId);

    try {
      return menu.execute(interaction);
    } catch (error) {
      console.error(error);
    }
  }
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "uhh can u say that again?",
        ephemeral: true,
      });
    } else {
      await interaction.editReply({
        content: "uhh can u say that again?",
        ephemeral: true,
      });
    }
  }
});

client.on("messageCreate", (message) => {
  if (!message.guild) return false;
  let id = message.guild.id;

  let custom_tags = tags.prepare(`SELECT * FROM guild_${id}`).all();

  if (debug === "true") console.log("[DEBUG] Got a message!");

  custom_tags.forEach((tag) => {
    if (
      !message.author.bot &&
      message.content === tag.tag &&
      settings.prepare(`SELECT * FROM guild_${id} WHERE option = 'state'`).get()
        .value === "commands"
    ) {
      if (debug === "true") console.log("[DEBUG] Tag found!");
      let responses = tag.response.split("---\n");
      message.channel.send(
        responses[Math.floor(Math.random() * responses.length)]
      );
    }
  });

  if (message.author.bot && message.author.discriminator != "0000")
    return false;
  if (message.channel.type === ChannelType.DM) return false;
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
