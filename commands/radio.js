const InvidJS = require("@invidjs/invid-js");
const debug = require("../index");
const common = require("../music");
const sqlite3 = require("better-sqlite3");

const masterqueue = new sqlite3("./data/queue.db");
const settings = new sqlite3("./data/settings.db");
const instances = new sqlite3("./data/instances_cache.db");
module.exports = {
  name: "radio",
  aliases: ["r"],
  description: "85.2 FM - relaxing gaming music",
  async execute(message) {
    message.react(`⌛`);
    let event = settings
      .prepare(`SELECT * FROM global WHERE option = 'event_code'`)
      .get().value;
    const id = message.guild.id;
    if (!message.member.voice.channel) {
      if (debug.debug === true)
        console.log("[DEBUG] No voice channel found, aborting...");
      return message.reply("You need to join a voice channel first!");
    }
    settings
      .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
      .run("radio", "music_mode");
    common.endTimeout(id);
    let default_url = instances.prepare('SELECT * FROM instances ORDER BY RANDOM() LIMIT 1').get().url;
    let instance = await InvidJS.fetchInstances({ url: default_url });
    if (event > -1) {
      message.reply(
        "Today is a special day on 85.2 FM!",
      );
      let music_id = "";
      switch (event) {
        case 0: {
          music_id = "2EP3fDx644w";
          break;
        }
        case 1: {
          music_id = "4tYWk6LQPNo";
          break;
        }
        case 2: {
          music_id = "ZN7LdisXipc";
          break;
        }
        case 3: {
          music_id = "f2yjJj6KPLo";
          break;
        }
        case 4: {
          music_id = "8govMKZf5Cs";
          break;
        }
        case 5: {
          music_id = "ZEhBTtjmBSs";
          break;
        }
        case 6: {
          music_id = "AfjqL0vaBYU";
          break;
        }
      }
      let url = default_url + `/watch?v=${music_id}`;
      await common.getVideo(url, message, true, false);
      return masterqueue
        .prepare(`UPDATE guild_${id} SET isLooped = 'true' LIMIT 1`)
        .run();
    }
    message.reply(
      "Tuning in to 85.2 FM - Relaxing & Positive Vibes station...",
    );
    let channel = await InvidJS.fetchChannel(
      instance[0],
      "UCubokaJqWnfPdVpFw_G_Q2w",
      {
        type: InvidJS.FetchTypes.Full,
      },
    );
    let playlists = await InvidJS.fetchChannelPlaylists(instance[0], channel);
    while (settings.prepare(`SELECT * FROM guild_${id} WHERE option = ?`).get("music_mode").value === "radio") {
      let randPlaylist = Math.floor(Math.random() * playlists.length);
      let playlist = await InvidJS.fetchPlaylist(
        instance[0],
        playlists[randPlaylist].id,
      );
      let video = Math.floor(Math.random() * playlist.videoCount);
      let url = default_url + "/watch?v=" + playlist.videos[video].id;
      await common.getVideo(url, message, true, false);
    }
  },
};
