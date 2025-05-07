import "dotenv/config";

import sqlite3 from "better-sqlite3";
import cron from "cron";
import Discord from "discord.js";
import fs from "fs-extra";
import path from "path";

import engine from "./utils/Engine.js";

if (!fs.existsSync(engine.dataFolder)) fs.mkdirSync(engine.dataFolder);
if (!fs.existsSync(engine.logsFolder)) fs.mkdirSync(engine.logsFolder);
if (!fs.existsSync(engine.cacheFolder)) fs.mkdirSync(engine.cacheFolder);

if (engine.token === "") {
  console.error("Please provide a valid token!");
  process.exit();
}

if (engine.name === "") {
  console.error("Please provide a valid username!");
  process.exit();
}

engine.debugLog(`WARNING: ${engine.name} is in Debug Mode! 
  Debug Mode is intended to be used for testing purposes only. 
  In this mode, ${engine.name} will log most actions and commands, including sensitive information. Telemetry is automatically enabled in this mode.
  We highly recommend redirecting the output to a file. 
  This mode is not recommended for use in production. Please proceed with caution.`);
engine.debugLog(`Build hash: ${engine.build_hash}`);

import musicEngine from "./utils/music.js";

const client = new Discord.Client({
  intents: engine.intents,
});

const settings = new sqlite3(engine.dataFolder + engine.settingsDB);
const queue = new sqlite3(engine.dataFolder + engine.queueDB);
const tags = new sqlite3(engine.dataFolder + engine.tagsDB);
const cache = new sqlite3(engine.dataFolder + engine.cacheDB);

client.commands = new Discord.Collection();
const commandFolders = fs.readdirSync(engine.commandsFolder);

for (const folder of commandFolders) {
  const commandsPath = path.join(engine.commandsFolder, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const { default: command } = await import(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      engine.debugLog(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
      );
    }
  }
}

client.modals = new Discord.Collection();
const modalFiles = fs
  .readdirSync(engine.modalsFolder)
  .filter((file) => file.endsWith(".js"));

for (const file of modalFiles) {
  const { default: modal } = await import(engine.modalsFolder + "/" + file);
  if ("name" in modal && "execute" in modal) {
    client.modals.set(modal.name, modal);
  } else {
    engine.debugLog(
      `[WARNING] The modal at ${file} is missing a required "name" or "execute" property.`,
    );
  }
}

client.buttons = new Discord.Collection();
const buttonFiles = fs
  .readdirSync(engine.buttonsFolder)
  .filter((file) => file.endsWith(".js"));

for (const file of buttonFiles) {
  const { default: button } = await import(engine.buttonsFolder + "/" + file);
  if ("name" in button && "execute" in button) {
    client.buttons.set(button.name, button);
  } else {
    engine.debugLog(
      `[WARNING] The button at ${file} is missing a required "name" or "execute" property.`,
    );
  }
}

client.menus = new Discord.Collection();
const menuFiles = fs
  .readdirSync(engine.menusFolder)
  .filter((file) => file.endsWith(".js"));

for (const file of menuFiles) {
  const { default: menu } = await import(engine.menusFolder + "/" + file);
  if ("name" in menu && "execute" in menu) {
    client.menus.set(menu.name, menu);
  } else {
    engine.debugLog(
      `[WARNING] The menu at ${file} is missing a required "name" or "execute" property.`,
    );
  }
}

function CheckForPerms(id) {
  let guild = client.guilds.cache.get(id);
  engine.debugLog(`Checking for permissions in guild ${id}...`);
  let notifs_value = settings
    .prepare(`SELECT * FROM guild_${id} WHERE option = 'notifications'`)
    .get().value;
  if (notifs_value === "false") {
    engine.debugLog(
      `Guild ${id} has notifications disabled. Message will not be sent.`,
    );
    return false;
  }
  if (!guild.members.me.has(RequiredPerms)) {
    engine.debugLog(`Sending permissions alert for guild ${id}...`);
    let guild_owner = guild.ownerId;
    let message = `The bot must have the following permissions in ${guild.name}:\n\nView Channel\nRead Message History\nSend Messages\nManage Messages\nConnect\nSpeak\n\nPlease check your role and member settings!`;
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
          engine.debugLog(
            `Cannot message owner of guild ${id}. Message will not be sent.`,
          );
          return false;
        }
      });
  } else {
    engine.debugLog(`Guild ${id} has all required permissions.`);
    return true;
  }
}

function verifyCache() {
  cache
    .prepare(
      `CREATE TABLE IF NOT EXISTS files_directory (name TEXT, filename TEXT, md5Hash TEXT UNIQUE)`,
    )
    .run();
  let options = fs.readdirSync(engine.cacheFolder);
  if (options.length !== 0) {
    let dbFiles = cache.prepare(`SELECT filename FROM files_directory`).all();
    let currentFilesSet = new Set(options);
    dbFiles.forEach(({ filename }) => {
      if (!currentFilesSet.has(filename)) {
        cache
          .prepare(`DELETE FROM files_directory WHERE filename = ?`)
          .run(filename);
      }
    });
    options.forEach(async (opt) => {
      let hash = await musicEngine.getHash(engine.cacheFolder);
      cache
        .prepare(`INSERT OR IGNORE INTO files_directory VALUES (?, ?, ?)`)
        .run(opt, opt, hash);
      cache
        .prepare(`UPDATE files_directory SET md5Hash = ? WHERE filename = ?`)
        .run(hash, opt);
    });
  } else {
    return false;
  }
}

function clearMusicData(id) {
  engine.debugLog(`Bot has restarted, clearing music data for guild ${id}.`);
  musicEngine.clearQueue(id);
  musicEngine.players.delete(id);
  musicEngine.connections.delete(id);
  musicEngine.timeouts.delete(id);
  //service.music_pages.delete(id);
}

function createConfig(id) {
  engine.debugLog(`Creating/validating config for guild ${id}.`);
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
  engine.debugLog("Validating settings...");
  let tables = settings
    .prepare(`SELECT name FROM sqlite_schema WHERE type='table'`)
    .all();
  tables.forEach((row) => {
    let id = row.name.split("_")[1];
    if (!client.guilds.cache.has(id)) deleteConfig(id);
  });
}

function deleteConfig(id) {
  engine.debugLog(`Deleting config for guild ${id}...`);
  settings.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
  queue.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
  tags.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
}

function editActivity() {
  let gamestring = Math.floor(
    Math.random() * process.env.ACTIVITIES.split(",").length,
  );
  engine.debugLog(`Editing bot activity...`);
  client.user.setActivity(process.env.ACTIVITIES.split(",")[gamestring]);
}

client.on("ready", () => {
  client.user.setUsername(engine.name);
  client.user.setAvatar(engine.avatar);
  validateSettings();
  verifyCache();
  let permcheck = new cron.CronJob("00 00 */8 * * *", CheckForPerms);
  permcheck.start();

  engine.debugLog("Running jobs for every guild...");
  client.guilds.cache.forEach((guild) => {
    createConfig(guild.id);
    clearMusicData(guild.id);
  });
  if (process.env.ACTIVITIES.split(",") !== undefined) {
    let job = new cron.CronJob("00 00 * * * *", editActivity);
    job.start();
    editActivity();
  }
  engine.debugLog("Jobs completed...");
  console.log(`Logged in as ${process.env.NAME}! Have a nice day!`);
});

client.on("guildCreate", (guild) => {
  engine.debugLog(`A new guild (${guild.id}) has been added!`);
  createConfig(guild.id);
});

client.on("guildDelete", (guild) => {
  engine.debugLog(`A guild (${guild.id}) has been removed!`);
  deleteConfig(guild.id);
});

client.on("interactionCreate", async (interaction) => {
  let id = interaction.guild.id;
  let monitor = engine.monitorPerformance(interaction.id);

  if (interaction.isModalSubmit()) {
    const modal = interaction.client.modals.get(interaction.customId);

    try {
      engine.debugLog(`Trying to execute ${interaction.customId} in ${id}.`);
      modal.execute(interaction);
      if (monitor !== undefined) return monitor.end();
      else return;
    } catch (error) {
      engine.reportError(error);
      engine.debugLog("Error: " + error.message);
      return;
    }
  }

  if (interaction.isButton()) {
    const button = interaction.client.buttons.get(interaction.customId);

    try {
      engine.debugLog(`Trying to execute ${interaction.customId} in ${id}.`);
      button.execute(interaction);
      if (monitor !== undefined) return monitor.end();
      else return;
    } catch (error) {
      engine.reportError(error);

      engine.debugLog("Error: " + error.message);
      return;
    }
  }

  if (interaction.isAnySelectMenu()) {
    const menu = interaction.client.menus.get(interaction.customId);

    try {
      engine.debugLog(`Trying to execute ${interaction.customId} in ${id}.`);
      menu.execute(interaction);
      if (monitor !== undefined) return monitor.end();
      else return;
    } catch (error) {
      engine.reportError(error);

      engine.debugLog("Error: " + error.message);
      return;
    }
  }
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    engine.debugLog(`Trying to execute ${interaction.commandName} in ${id}.`);
    if (command.shouldWait !== false)
      await interaction.deferReply({ flags: Discord.MessageFlags.Ephemeral });
    await command.execute(interaction);
    if (monitor !== undefined) return monitor.end();
    else return;
  } catch (error) {
    engine.reportError(error);

    engine.debugLog("Error: " + error.message);
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

  engine.debugLog("Got a message!");

  let monitor = undefined;

  custom_tags.forEach((tag) => {
    if (!message.author.bot && message.content === tag.tag) {
      engine.debugLog("Tag found!");
      if (process.env.TELEMETRY === "true" || process.env.DEBUG === "true") {
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
  engine.reportError(error);
  engine.debugLog("Error: " + error.message);
});

process.on("uncaughtException", (error) => {
  engine.reportError(error);
  engine.debugLog("Error: " + error.message);
});

process.on("SIGINT", () => {
  console.log("Exiting...");
  process.exit();
});

client.login(process.env.TOKEN);
