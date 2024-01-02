import * as InvidJS from "@invidjs/invid-js";
const debug = process.env.DEBUG;
import sqlite3 from "better-sqlite3";
const common = await import("../music.js");
import Discord from "discord.js";

const masterqueue = new sqlite3("./data/queue.db");
const settings = new sqlite3("./data/settings.db");
export default {
  name: "search",
  description: "Search a track",
  async execute(message, args) {
    const id = message.guild.id;
    if (!args[0]) {
      if (debug === "true")
        console.log("[DEBUG] Invalid input, aborting...");
      return message.reply("Provide a valid search query!");
    }
    let default_url = settings
      .prepare(`SELECT * FROM guild_${id} WHERE option = 'default_instance'`)
      .get().value;
    let min_health = settings
      .prepare(`SELECT * FROM guild_${id} WHERE option = 'min_health'`)
      .get().value;
    let query = args.slice(0).join(" ");
    if (debug === "true") {
      console.log(`[DEBUG] User query: ${query}...`);
      console.log("[DEBUG] Searching...");
    }
    let instance = await InvidJS.fetchInstances({ url: default_url });
    let results = await InvidJS.searchContent(instance[0], query, {
      limit: 5,
      type: InvidJS.ContentTypes.Video,
    });
    if (!results.length) {
      if (debug === "true") console.log("[DEBUG] No content was found...");
      return message.reply("No content was found based on your search query!");
    }
    let searchembed = new Discord.EmbedBuilder();
    results.forEach((track) => {
      searchembed.addFields({
        name: track.title,
        value: default_url + "/watch?v=" + track.id,
        inline: false,
      });
    });
    searchembed.setTitle("Please select a track:");
    searchembed.setColor("#0099ff");
    searchembed.setFooter({ text: "Powered by InvidJS" });
    let embedmessage = await message.channel.send({
      embeds: [searchembed],
    });
    embedmessage.react(`1️⃣`);
    embedmessage.react(`2️⃣`);
    embedmessage.react(`3️⃣`);
    embedmessage.react(`4️⃣`);
    embedmessage.react(`5️⃣`);
    const filter = (reaction, user) =>
      reaction.emoji.name === `1️⃣` ||
      reaction.emoji.name === `2️⃣` ||
      reaction.emoji.name === `3️⃣` ||
      reaction.emoji.name === `4️⃣` ||
      (reaction.emoji.name === `5️⃣` && user.id === message.author.id);
    let choice = 0;
    if (debug === "true")
      console.log("[DEBUG] Choice required - awaiting user input...");
    embedmessage
      .awaitReactions({ filter, maxUsers: 2 })
      .then((collected) =>
        collected.forEach(async (emoji) => {
          if (emoji.count > 1) {
            common.endTimeout(id);
            if (debug === "true")
              console.log(`[DEBUG] User choice: ${choice}...`);
            videoid = results[choice].id;
            let url = default_url + "/watch?v=" + videoid;
            if (debug === "true")
              console.log(`[DEBUG] Validating ${url}...`);
            let fetched = await common.getVideo(url, message.channel);
            let queuelength = masterqueue
              .prepare(`SELECT * FROM guild_${id}`)
              .all().length;
            if (fetched !== undefined) {
              if (fetched.instance.health < min_health) {
                if (debug === "true")
                  console.log(
                    "[DEBUG] Instance not healthy enough, sending a warning...",
                  );
                message.channel.send(
                  "ALERT: Instance health too low. Please consider using a different instance.",
                );
              }
              if (debug === "true")
                console.log(`[DEBUG] Adding ${url} to the queue...`);
              masterqueue
                .prepare(`INSERT INTO guild_${id} VALUES (?, ?, ?)`)
                .run(url, message.author.id, "false");
              if (queuelength === 0) {
                if (debug === "true")
                  console.log("[DEBUG] Downloading stream...");
                let stream = await InvidJS.fetchSource(
                  fetched.instance,
                  fetched.video,
                  fetched.format,
                  { saveTo: InvidJS.SaveSourceTo.Memory, parts: 10 },
                );
                if (debug === "true")
                  console.log("[DEBUG] Creating player...");
                message.channel.send(
                  `Now playing: ${fetched.url}\nRequested by <@!${message.author.id}>`,
                );
                common.playMusic(
                  message.member.voice.channel,
                  message.channel,
                  stream,
                  fetched,
                );
              } else {
                message.reply(`Added ${fetched.url} to the queue!`);
              }
            }
          } else {
            choice++;
          }
        }),
      )
      .catch();
  },
};
