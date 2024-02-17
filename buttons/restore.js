import sqlite3 from "better-sqlite3";
const debug = process.env.DEBUG;
import Discord from "discord.js";

const settings = new sqlite3("./data/settings.db");
const tags = new sqlite3("./data/tags.db");

export default {
  name: "restore",
  async execute(interaction) {
    const id = interaction.guild.id;
    settings
      .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
      .run("wizard", "state");
    const cancel = new Discord.ButtonBuilder()
      .setCustomId(`cancel`)
      .setLabel(`Cancel`)
      .setStyle(Discord.ButtonStyle.Primary);
    const row = new Discord.ActionRowBuilder().addComponents(cancel);
    const filter = (m) => m.author.id == interaction.user.id;

    interaction.reply({
      content:
        "Please provide the JSON file you received as a backup.\n**This will erase all server settings if you proceed!**",
      components: [row],
      ephemeral: true,
    });
    if (debug === "true")
      console.log("[DEBUG] File required - awaiting user input...");
    let file_collector = interaction.channel.createMessageCollector({
      filter,
      max: 1,
    });
    file_collector.on("collect", (m) => {
      switch (m.content) {
        default: {
          if (
            Array.from(m.attachments).length === 0 ||
            Array.from(m.attachments).length > 1 ||
            Array.from(m.attachments)[0][1].name !== `${id}.json`
          ) {
            m.delete();
            if (debug === "true")
              console.log("[DEBUG] Invalid input, aborting...");
            settings
              .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
              .run("commands", "state");
            return interaction.editReply({
              content: "You must provide a valid backup file!",
              components: [],
              ephemeral: true,
            });
          }
          fetch(m.attachments.first().url).then((res) => {
            m.delete();
            if (debug === "true")
              console.log(
                "[DEBUG] User provided a valid JSON file, retrieving...",
              );
            res.json().then((json) => {
              let settings_backup = JSON.parse(json.split("\n")[0]);
              let tags_backup = JSON.parse(json.split("\n")[1]);
              if (debug === "true") {
                console.log("[DEBUG] Fetch successful!");
                console.log("[DEBUG] Settings JSON: " + settings_backup);
                console.log("[DEBUG] Tags JSON: " + tags_backup);
                console.log("[DEBUG] Resetting all settings!");
              }
              settings
                .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
                .run(settings_backup[0].value, "notifications");
              settings
                .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
                .run(settings_backup[1].value, "disconnect_timeout");
              settings
                .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
                .run(settings_backup[2].value, "min_health");
              tags.prepare(`DELETE FROM guild_${id}`).run();
              tags_backup.forEach((tag) => {
                tags
                  .prepare(`INSERT OR IGNORE INTO guild_${id} VALUES (?, ?)`)
                  .run(tag.tag, tag.response);
              });
              if (debug === "true") console.log("[DEBUG] Restore successful!");
              settings
                .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
                .run("commands", "state");
              return interaction.editReply({
                content: "Restore completed successfully!",
                components: [],
                ephemeral: true,
              });
            });
          });
        }
      }
    });
  },
};
