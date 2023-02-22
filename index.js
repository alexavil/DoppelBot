const fs = require("fs-extra");
const Discord = require("discord.js");
const cron = require("cron");
const token = process.env.TOKEN || process.argv[2];
const sqlite3 = require("better-sqlite3");
const { Permissions, Intents } = require("discord.js");
const child = require("child_process");

const client = new Discord.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_WEBHOOKS,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING,
  ],
});
client.commands = new Discord.Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const settings = new sqlite3("./data/settings.db");
const queue = new sqlite3("./data/queue.db");
const tags = new sqlite3("./data/tags.db");


const RequiredPerms = [
  [Permissions.FLAGS.VIEW_CHANNEL, "View Channels"],
  [Permissions.FLAGS.READ_MESSAGE_HISTORY, "Read Message History"],
  [Permissions.FLAGS.SEND_MESSAGES, "Send Messages"],
  [Permissions.FLAGS.MANAGE_MESSAGES, "Manage Messages"],
  [Permissions.FLAGS.CONNECT, "Connect"],
  [Permissions.FLAGS.SPEAK, "Speak"],
  [Permissions.FLAGS.ADD_REACTIONS, "Add Reactions"],
];

let activities = undefined;

if (fs.existsSync("./activities.json")) {
  activities = fs.readJSONSync("./activities.json");
}

const Sentry = require("@sentry/node");

function initSentry() {
  Sentry.init({
      dsn: "https://546220d2015b4064a1c2363c6c6089f2@o4504711913340928.ingest.sentry.io/4504712612872192",
      tracesSampleRate: 1.0
  })
}

function CheckForPerms() {
  console.log("Checking permissions...");
  client.guilds.cache.forEach((guild) => {
    let id = guild.id;
    let notifs_value = settings
      .prepare(`SELECT * FROM guild_${id} WHERE option = 'notifications'`)
      .get().value;
    if (notifs_value === "false") return console.log("No reasons to check!");
    let botmember = guild.me;
    let guild_owner = guild.ownerId;
    let message = `The bot is missing the following permissions in ${guild.name}:\n\n`;
    let missing = 0;
    RequiredPerms.forEach((perm) => {
      if (!botmember.permissions.has(perm[0])) {
        console.log(`Missing ${perm[1]} permission in ${guild.name}!`);
        message += `${perm[1]}\n`;
        missing++;
      }
    });
    if (missing > 0) {
      message += `\nPlease check your role and member settings!`;
      const outbtn = new Discord.MessageButton()
        .setCustomId(`${guild.id}_opt-out`)
        .setLabel(`Opt-out of service notifications in ${guild.name}`)
        .setStyle("DANGER");
      const row = new Discord.MessageActionRow().addComponents(outbtn);
      const embed = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle("Alert!")
        .setDescription(message);
      client.users.cache
        .get(guild_owner)
        .send({ embeds: [embed], components: [row] })
        .catch((err) => {
          if (err.code === Discord.Constants.APIErrors.CANNOT_MESSAGE_USER) {
            return console.log(
              `The owner of ${guild.name} has disabled direct messages!`
            );
          }
        });
    } else {
      return console.log("All clear!");
    }
  });
}

function clearQueue(id) {
  queue.prepare(`DELETE FROM guild_${id}`).run();
}

function prepareGlobalSettings() {
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
  child.exec(
    "git fetch -q && git ls-remote --heads --quiet",
    (err, stdout, stderr) => {
      if (err) {
        console.log(err);
      } else {
        settings
          .prepare(
            "update global set value = ? where option = 'current_version'"
          )
          .run(stdout.toString().substring(0, 7));
      }
    }
  );
}

function createConfig(id) {
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
    .run("state", "commands");
  queue
    .prepare(`CREATE TABLE IF NOT EXISTS guild_${id} (track TEXT, author TEXT)`)
    .run();
  tags
    .prepare(`CREATE TABLE IF NOT EXISTS guild_${id} (tag TEXT, response TEXT)`)
    .run();
}

function deleteConfig(id) {
  settings.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
  queue.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
  tags.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
}

function gamecycle() {
  let games = activities.games;
  let gamestring = Math.floor(Math.random() * games.length);
  client.user.setActivity(games[gamestring]);
}

client.on("ready", () => {
  prepareGlobalSettings();
  console.log("I am ready!");
  initSentry();
  let permcheck = new cron.CronJob("00 00 */8 * * *", CheckForPerms);
  permcheck.start();
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
});

client.on("guildCreate", (guild) => {
  createConfig(guild.id);
});

client.on("guildDelete", (guild) => {
  deleteConfig(guild.id);
});

client.on("interactionCreate", (interaction) => {
  if (interaction.customId.endsWith("opt-out")) {
    let id = interaction.customId.split("_")[0];
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

  responses.forEach((response) => {
    if (
      !message.author.bot &&
      message.content == response.tag &&
      settings.prepare(`SELECT * FROM guild_${id} WHERE option = 'state'`).get()
        .value === "commands"
    )
      message.channel.send(response.response);
  });

  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  let prefix = settings
    .prepare(`SELECT * FROM guild_${id} WHERE option = 'prefix'`)
    .get().value;

  if (message.author.bot && message.author.discriminator != "0000")
    return false;
  if (message.channel.type === "dm") return false;
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
      return message.reply("You do not have permission to use this command!");
    }
  }

  try {
    if (
      settings.prepare(`SELECT * FROM guild_${id} WHERE option = 'state'`).get()
        .value === "commands"
    ) 
      command.execute(message, args); 
  } catch (error) {
    if (error.code === Discord.Constants.APIErrors.MISSING_PERMISSIONS) {
      return message.reply(
        "I don't have permissions to do that action! Check the Roles page!"
      );
    }
    Sentry.captureException(error);
    console.error(error);
    console.log(error);
    message.reply("There was an error trying to execute that command!");
  }
});

process.on("unhandledRejection", (error) => {
  Sentry.captureException(error);
  console.error("Error:", error);
});

process.on("uncaughtException", (error) => {
  Sentry.captureException(error);
  console.error("Error:", error);
})

client.login(token);
