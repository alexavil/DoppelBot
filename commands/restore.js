const sqlite3 = require("better-sqlite3");
const fs = require("fs-extra");

const settings = new sqlite3("./data/settings.db");
const tags = new sqlite3("./data/tags.db");

module.exports = {
  name: "restore",
  description: "Restore your server settings",
  userpermissions: "ADMINISTRATOR",
  async execute(message, args) {
    const id = message.guild.id;
    settings
      .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
      .run("wizard", "state");
    const filter = (m) => m.author.id == message.author.id;

    message.channel.send(
      "Please provide the JSON file you received as a backup or type `cancel` to cancel.\n**This will erase all server settings if you proceed!**"
    );
    let file_collector = message.channel.createMessageCollector({
      filter,
      max: 1,
    });
    file_collector.on("collect", (m) => {
      switch (m.content) {
        case "cancel": {
          settings
            .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
            .run("commands", "state");
          return message.channel.send("Cancelled!");
        }
        default: {
          if (
            Array.from(m.attachments).length === 0 ||
            Array.from(m.attachments).length > 1 ||
            Array.from(m.attachments)[0][1].name !== `${id}.json`
          ) {
            settings
              .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
              .run("commands", "state");
            return message.channel.send(
              "You must provide a valid backup file!"
            );
          }
          fetch(m.attachments.first().url).then((res) => {
            res.json().then((json) => {
              console.log(json);
              let settings_backup = JSON.parse(json.split("\n")[0]);
              let tags_backup = JSON.parse(json.split("\n")[1]);
              settings
                .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
                .run(settings_backup[0].value, "prefix");
              settings
                .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
                .run(settings_backup[1].value, "notifications");
              settings
                .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
                .run(settings_backup[2].value, "disconnect_timeout");
              settings
                .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
                .run(settings_backup[3].value, "default_instance");
              settings
                .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
                .run(settings_backup[3].value, "instance_health_threshold");
              tags.prepare(`DELETE FROM guild_${id}`).run();
              tags_backup.forEach((tag) => {
                console.log(tag);
                tags
                  .prepare(`INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`)
                  .run(tag.tag, tag.response);
              });
              settings
                .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
                .run("commands", "state");
              return message.channel.send("Restore completed successfully!");
            });
          });
        }
      }
    });
  },
};
