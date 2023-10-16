const InvidJS = require("@invidjs/invid-js");
const debug = require("../index");
const sqlite3 = require("better-sqlite3");
const common = require("../music");
const Discord = require("discord.js");

const settings = new sqlite3("./data/settings.db");
const instances = new sqlite3("./data/instances_cache.db");
module.exports = {
  name: "search",
  description: "Search a track",
  async execute(message, args) {
    const id = message.guild.id;
    if (
      settings
        .prepare(`SELECT * FROM guild_${id} WHERE option = ?`)
        .get("music_mode").value === "radio"
    )
      return message.reply(
        "You can't use this command while tuned to 85.2 FM!",
      );
    if (!args[0]) {
      if (debug.debug === true)
        console.log("[DEBUG] Invalid input, aborting...");
      return message.reply("Provide a valid search query!");
    }
    let default_url = instances.prepare('SELECT * FROM instances ORDER BY RANDOM() LIMIT 1').get().url;
    let query = args.slice(0).join(" ");
    if (debug.debug === true) {
      console.log(`[DEBUG] User query: ${query}...`);
      console.log("[DEBUG] Searching...");
    }
    let instance = await InvidJS.fetchInstances({ url: default_url });
    let results = await InvidJS.searchContent(instance[0], query, {
      limit: 5,
      type: InvidJS.ContentTypes.Video,
    });
    if (!results.length) {
      if (debug.debug === true) console.log("[DEBUG] No content was found...");
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
    if (debug.debug === true)
      console.log("[DEBUG] Choice required - awaiting user input...");
    embedmessage
      .awaitReactions({ filter, maxUsers: 2 })
      .then((collected) =>
        collected.forEach(async (emoji) => {
          if (emoji.count > 1) {
            common.endTimeout(id);
            if (debug.debug === true)
              console.log(`[DEBUG] User choice: ${choice}...`);
            videoid = results[choice].id;
            let url = default_url + "/watch?v=" + videoid;
            await common.getVideo(url, message, false, true);
          } else {
            choice++;
          }
        }),
      )
      .catch();
  },
};
