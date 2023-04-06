const sqlite3 = require("better-sqlite3");
const Discord = require("discord.js");
const debug = require("../index");

const settings = new sqlite3("./data/settings.db");
const tags = new sqlite3("./data/tags.db");

module.exports = {
  name: "tags",
  description: "Tags control",
  aliases: ["t"],
  async execute(message, args) {
    const id = message.guild.id;
    if (args.length === 0) {
      return message.reply("Provide a command!");
    }

    switch (args[0]) {
      case "create":
      case "c": {
        if (debug.debug === true)
          console.log("[DEBUG] Starting tag creation for " + id + "...");
        if (!message.channel.permissionsFor(message.author).has(Discord.PermissionsBitField.Flags.BanMembers))
          return message.reply(
            "You do not have permission to use this command!"
          );
        settings
          .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
          .run("wizard", "state");
        let keyword = undefined;
        let response = undefined;
        const filter = (m) => m.author.id == message.author.id;

        message.channel.send(
          "Please provide a key word or phrase or type `cancel` to cancel."
        );
        let keyword_collector = message.channel.createMessageCollector({
          filter,
          max: 1,
        });
        keyword_collector.on("collect", (m) => {
          switch (m.content) {
            case "cancel":
              if (debug.debug === true)
                console.log("[DEBUG] User cancelled, aborting...");
              settings
                .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
                .run("commands", "state");
              return message.channel.send("Cancelled!");
            default:
              if (
                m.content.startsWith(
                  settings
                    .prepare(
                      `SELECT * FROM guild_${id} WHERE option = 'prefix'`
                    )
                    .get().value
                ) ||
                (m.content.startsWith("<@") && m.content.endsWith(">"))
              ) {
                if (debug.debug === true)
                  console.log("[DEBUG] Invalid input, aborting...");
                settings
                  .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
                  .run("commands", "state");
                return message.channel.send(
                  "Tags can't start with a prefix or mention!"
                );
              }
              keyword = m.content;
              if (debug.debug === true)
                console.log("[DEBUG] Keyword: " + keyword);
              let tag = tags
                .prepare(`SELECT * FROM guild_${id} WHERE tag = ?`)
                .get(keyword);
              if (tag !== undefined) {
                if (debug.debug === true)
                  console.log("[DEBUG] Tag already exists, aborting...");
                settings
                  .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
                  .run("commands", "state");
                return message.channel.send(
                  "A tag with that key word already exists!"
                );
              }
              message.channel.send(
                "Please provide the response or type `cancel` to cancel."
              );
              let response_collector = message.channel.createMessageCollector({
                filter,
                max: 1,
              });
              response_collector.on("collect", (m) => {
                switch (m.content) {
                  case "cancel":
                    if (debug.debug === true)
                      console.log("[DEBUG] User cancelled, aborting...");
                    settings
                      .prepare(
                        `UPDATE guild_${id} SET value = ? WHERE option = ?`
                      )
                      .run("commands", "state");
                    return message.channel.send("Cancelled!");
                  default:
                    response = m.content;
                    if (debug.debug === true) {
                      console.log("[DEBUG] Response: " + response);
                      console.log("[DEBUG] Creating tag...");
                    }
                    tags
                      .prepare(
                        `INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`
                      )
                      .run(keyword, response);
                    settings
                      .prepare(
                        `UPDATE guild_${id} SET value = ? WHERE option = ?`
                      )
                      .run("commands", "state");
                    return message.channel.send("Tag created successfully!");
                }
              });
          }
        });
        break;
      }

      case "delete":
      case "d": {
        if (debug.debug === true)
          console.log("[DEBUG] Starting tag deletion for " + id + "...");
        if (!message.channel.permissionsFor(message.author).has(Discord.PermissionsBitField.Flags.BanMembers))
          return message.reply(
            "You do not have permission to use this command!"
          );
        if (
          !args[1] ||
          tags
            .prepare(`SELECT * FROM guild_${id} WHERE tag = '${args[1]}'`)
            .get() === undefined
        ) {
          if (debug.debug === true)
            console.log("[DEBUG] Invalid input, aborting...");
          return message.channel.send("Please type a valid tag to delete!");
        }
        tags.prepare(`DELETE FROM guild_${id} WHERE tag = '${args[1]}'`).run();
        return message.channel.send("Tag deleted successfully!");
      }

      case "list":
      case "l": {
        if (debug.debug === true)
          console.log("[DEBUG] Fetching tag list for " + id + "...");
        let responses = tags.prepare(`SELECT * FROM guild_${id}`).all();
        let tagsembed = new Discord.EmbedBuilder().setTitle(
          `Tags for ${message.guild.name}`
        );
        if (responses.length === 0) {
          if (debug.debug === true) console.log("[DEBUG] No tags found...");
          tagsembed.setDescription("This server has no active tags yet!");
          return message.channel.send({ embeds: [tagsembed] });
        }
        responses.forEach((response) => {
          tagsembed.addFields({
            name: `Key Phrase: ${response.tag}`,
            value: `Response: ${response.response}`,
          });
        });
        return message.channel.send({ embeds: [tagsembed] });
      }
    }
  },
};
