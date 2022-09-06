const fs = require("fs");
const Discord = require("discord.js");
const cron = require("cron");
const token = process.env.TOKEN || process.argv[2];
const sqlite3 = require('better-sqlite3');
const {
  Intents,
  Permissions
} = require("discord.js");

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

const responses = JSON.parse(fs.readFileSync("./responses.json"));
const settings = new sqlite3("./settings.db");
const queue = new sqlite3("./queue.db");

function createConfig(id) {
    settings.prepare(`CREATE TABLE IF NOT EXISTS guild_${id} (option TEXT UNIQUE, value TEXT)`).run();
    settings.prepare(`INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`).run("prefix", "d!");
    queue.prepare(`CREATE TABLE IF NOT EXISTS guild_${id} (track TEXT UNIQUE, author TEXT)`).run();
}

function deleteConfig(id) {
    settings.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
    queue.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
}

function gamecycle() {
  var games = responses.games;
  var gamestring = Math.floor(Math.random() * games.length);
  client.user.setActivity(games[gamestring]);
}

client.on("ready", () => {
  console.log("I am ready!");
  let job = new cron.CronJob("00 00 * * * *", gamecycle);
  job.start();
  client.guilds.cache.forEach((guild) => {
    createConfig(guild.id);
  });
  gamecycle();
});

client.on("guildCreate", (guild) => {
  createConfig(guild.id);
});

client.on("guildDelete", (guild) => {
  deleteConfig(guild.id);
});

client.on("messageCreate", (message) => {
  if (!message.guild) return;
  id = message.guild.id;

  const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');


  let prefix = settings.prepare(`SELECT * FROM guild_${id} WHERE option = 'prefix'`).get().value;

  if (message.author.bot) return;
  if (message.channel.type === "dm") return;
	const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
	if (!prefixRegex.test(message.content)) return;

	const [, matchedPrefix] = message.content.match(prefixRegex);
	const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
  console.log(args);
  const commandName = args.shift().toLowerCase();
  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) return;

  if (command.userpermissions) {
    const perms = message.channel.permissionsFor(message.author);
    if (!perms || !perms.has(command.userpermissions)) {
      return message.reply("you do not have permission to use this command!");
    }
  }

  try {
    command.execute(message, args, client, queue);
  } catch (error) {
    console.error(error);
    console.log(error.code);
    if (error.code === Discord.Constants.APIErrors.MISSING_PERMISSIONS) {
      message.reply(
        "I don't have permissions to do that action! Check the Roles page!"
      );
    } else message.reply("there was an error trying to execute that command!");
  }
});

process.on("unhandledRejection", (error) => {
  console.error("Error:", error);
});

client.login(token);
