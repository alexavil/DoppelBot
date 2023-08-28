const InvidJS = require("@invidjs/invid-js");
const Discord = require("discord.js");
const debug = require("../index");
const common = require("../music");
const sqlite3 = require("better-sqlite3");

const masterqueue = new sqlite3("./data/queue.db");
const settings = new sqlite3("./data/settings.db");
module.exports = {
  name: "radio",
  aliases: ["r"],
  description: "85.2 FM - relaxing gaming music",
  async execute(message, args) {
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
    let default_url = settings
      .prepare(`SELECT * FROM guild_${id} WHERE option = 'default_instance'`)
      .get().value;
    let instance = await InvidJS.fetchInstances({ url: default_url });
    console.log(debug.eventcode);
    if (debug.eventcode > -1) {
      message.reply(
        "85.2 FM is on a special event today! Tuning in to a broadcast prepared for this exciting day!",
      );
      let music_id = "";
      switch (debug.eventcode) {
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
    for (let i = 0; i < 128; i++) {
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
