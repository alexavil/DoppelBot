import Discord from "discord.js";
import sqlite3 from "better-sqlite3";
const debug = process.env.DEBUG;

const settings = new sqlite3("./data/settings.db");
const tags = new sqlite3("./data/tags.db");

export default {
  name: "createtag",
  aliases: ["tagc"],
  description: "Create a tag",
  execute(message, args) {
    let id = message.guild.id;
    if (
      !message.channel
        .permissionsFor(message.author)
        .has(Discord.PermissionsBitField.Flags.BanMembers)
    )
      return message.reply("You do not have permission to use this command!");
    if (!args[0]) {
      if (debug === "true") console.log("[DEBUG] Invalid input, aborting...");
      return message.channel.send("Please type a valid tag keyword!");
    }
    let keyword = undefined;
    let response = undefined;
    const filter = (m) => m.author.id == message.author.id;
    if (
      args[0].startsWith(
        settings
          .prepare(`SELECT * FROM guild_${id} WHERE option = 'prefix'`)
          .get().value
      ) ||
      (args[0].startsWith("<@") && m.content.endsWith(">"))
    ) {
      if (debug === "true") console.log("[DEBUG] Invalid input, aborting...");
      settings
        .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
        .run("commands", "state");
      return message.channel.send("Tags can't start with a prefix or mention!");
    }
    keyword = args[0];
    if (debug === "true") console.log("[DEBUG] Keyword: " + keyword);
    let tag = tags
      .prepare(`SELECT * FROM guild_${id} WHERE tag = ?`)
      .get(keyword);
    if (tag !== undefined) {
      if (debug === "true")
        console.log("[DEBUG] Tag already exists, aborting...");
      settings
        .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
        .run("commands", "state");
      return message.channel.send("A tag with that key word already exists!");
    }
    message.channel.send(
      `Please provide the response(s) or type \`cancel\` to cancel.
Each new response must be separated with dashes, e.g.:
\`response1\`
---
\`response2\``
    );
    if (debug === "true")
      console.log("[DEBUG] Response required - awaiting user input...");
    let response_collector = message.channel.createMessageCollector({
      filter,
      max: 1,
    });
    response_collector.on("collect", (m) => {
      switch (m.content) {
        case "cancel":
          if (debug === "true")
            console.log("[DEBUG] User cancelled, aborting...");
          settings
            .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
            .run("commands", "state");
          return message.channel.send("Cancelled!");
        default:
          response = m.content;
          if (debug === "true") {
            console.log("[DEBUG] Response: " + response);
            console.log("[DEBUG] Creating tag...");
          }
          tags
            .prepare(`INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`)
            .run(keyword, response);
          settings
            .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
            .run("commands", "state");
          return message.channel.send("Tag created successfully!");
      }
    });
  },
};
