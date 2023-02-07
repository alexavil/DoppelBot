const fs = require("fs");
const Discord = require("discord.js");
const cron = require("cron");
const token = process.env.TOKEN || process.argv[2];
const sqlite3 = require("better-sqlite3");
const { Permissions, Intents } = require("discord.js");

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

const RequiredPerms = [
  [Permissions.FLAGS.VIEW_CHANNEL, "View Channels"],
  [Permissions.FLAGS.READ_MESSAGE_HISTORY, "Read Message History"],
  [Permissions.FLAGS.SEND_MESSAGES, "Send Messages"],
  [Permissions.FLAGS.MANAGE_MESSAGES, "Manage Messages"],
  [Permissions.FLAGS.CONNECT, "Connect"],
  [Permissions.FLAGS.SPEAK, "Speak"],
  [Permissions.FLAGS.ADD_REACTIONS, "Add Reactions"],
];

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
    .run("notifications", "true");
  queue
    .prepare(`CREATE TABLE IF NOT EXISTS guild_${id} (track TEXT, author TEXT)`)
    .run();
}

function deleteConfig(id) {
  settings.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
  queue.prepare(`DROP TABLE IF EXISTS guild_${id}`).run();
}

function gamecycle() {
  let games = responses.games;
  let gamestring = Math.floor(Math.random() * games.length);
  client.user.setActivity(games[gamestring]);
}

client.on("ready", () => {
  console.log("I am ready!");
  let job = new cron.CronJob("00 00 * * * *", gamecycle);
  job.start();
  let permcheck = new cron.CronJob("00 00 * * * *", CheckForPerms);
  permcheck.start();
  client.guilds.cache.forEach((guild) => {
    createConfig(guild.id);
  });
  gamecycle();
  CheckForPerms();
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
