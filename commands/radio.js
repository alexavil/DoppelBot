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
    message.reply("Currently tuning to 85.2 FM - enjoy the relaxing video game music!")
    let default_url = settings
      .prepare(`SELECT * FROM guild_${id} WHERE option = 'default_instance'`)
      .get().value;
    let instance = await InvidJS.fetchInstances({ url: default_url });
    let date = new Date();
    if (date.getDate() === 9 && date.getMonth() === 7) {
      let url = default_url + "/watch?v=ZN7LdisXipc";
      await common.getVideo(url, message, true);
      return masterqueue
        .prepare(`UPDATE guild_${id} SET isLooped = 'true' LIMIT 1`)
        .run();
    }
    let channel = await InvidJS.fetchChannel(instance[0], "UCubokaJqWnfPdVpFw_G_Q2w", {
      type: InvidJS.FetchTypes.Full
    });
    let playlists = await InvidJS.fetchChannelPlaylists(instance[0], channel);
    common.endTimeout(id);
    settings
      .prepare(`UPDATE guild_${id} SET value = ? WHERE option = ?`)
      .run("radio", "music_mode");
    for (let i = 0; i < 128; i++) {
      let randPlaylist = Math.floor(Math.random() * playlists.length);
      let playlist = await InvidJS.fetchPlaylist(instance[0], playlists[randPlaylist].id);
      let video = Math.floor(Math.random() * playlist.videoCount);
      let url = default_url + "/watch?v=" + playlist.videos[video].id;
      await common.getVideo(url, message, true);
    }
  },
};
