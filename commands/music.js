const Discord = require("discord.js");
const InvidJS = require("@invidjs/invid-js");
const {
  AudioPlayerStatus,
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  NoSubscriberBehavior,
} = require("@discordjs/voice");
const sqlite3 = require("better-sqlite3");

const settings = new sqlite3("./data/settings.db");
const masterqueue = new sqlite3("./data/queue.db");
let timerId = undefined;
let isPaused = false;
let player = undefined;
let disallowedLinks = [
  "https://www.youtube.com/",
  "https://youtu.be/",
]

module.exports = {
  name: "music",
  description: "Music control",
  aliases: ["m"],
  async execute(message, args) {
    const id = message.guild.id;
    let url = "";
    let channel = message.member.voice.channel;
    let default_url = settings.prepare(`SELECT * FROM guild_${id} WHERE option = 'default_instance'`).get().value;
    let min_health = settings.prepare(`SELECT * FROM guild_${id} WHERE option = 'instance_health_threshold'`).get().value;

    async function streamCheck(url) {
      let stream = undefined;
      try {
        let instance = await InvidJS.fetchInstances({ url: url.split("/w")[0] });
        if (instance[0].health < min_health) {
          message.channel.send("WARNING: Instance health is low. Please consider selecting a different instance.");
        }
        let video = await InvidJS.fetchVideo(instance[0], url.split("=")[1]);
        let format = video.formats.find((format) => format.quality === "AUDIO_QUALITY_MEDIUM");
        stream = await InvidJS.fetchSource(instance[0], video, format, {saveTo: InvidJS.SaveSourceTo.Memory, parts: 5})
      } catch (error) {
        switch (error.code) {
          case InvidJS.ErrorCodes.APIBlocked: {
            return message.reply("The video could not be fetched due to API restrictions. The instance may not support API calls or may be down.");
          }
          case InvidJS.ErrorCodes.APIError: {
            return message.reply("The video could not be fetched due to an API error. Please try again later.");
          }
        }
        return undefined;
      }
      return stream;
    }

    async function setupQueue(url) {
      let stream = await streamCheck(url);
      if (stream === undefined) return false;
      masterqueue
        .prepare(`INSERT INTO guild_${id} VALUES (?, ?)`)
        .run(url, message.author.id);
      if (masterqueue.prepare(`SELECT * FROM guild_${id}`).all().length === 1) {
        playmusic(channel, url, message.author.id);
      } else {
        message.channel.send("Added " + url + " to queue!");
      }
    }

    async function playmusic(channel, url, author) {
      let stream = await streamCheck(url);
      if (stream === undefined) return false;
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Pause,
        },
      });
      player = createAudioPlayer();
      const resource = createAudioResource(stream, {
        inputType: stream.type,
      });
      message.channel.send(`Now playing: ${url}\nRequested by <@!${author}>`);
      player.play(resource);
      connection.subscribe(player);
      if (timerId !== undefined) clearTimeout(timerId);
      player.on(AudioPlayerStatus.Idle, () => {
        masterqueue
          .prepare(`DELETE FROM guild_${id} ORDER BY ROWID LIMIT 1`)
          .run();
        let track = masterqueue
          .prepare(`SELECT * FROM guild_${id} ORDER BY ROWID LIMIT 1`)
          .get();
        if (track || track != undefined) {
          playmusic(channel, track.track, track.author);
        } else {
          timerId = setTimeout(() => {
            message.channel.send("No more tracks to play, disconnecting!");
            if (connection) connection.destroy();
          }, parseInt(settings.prepare(`SELECT * FROM guild_${id} WHERE option = 'disconnect_timeout'`).get().value) * 1000);
        }
      });
    }

    async function sendEmbed(results) {
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
      embedmessage
        .awaitReactions({ filter, maxUsers: 2 })
        .then((collected) =>
          collected.forEach((emoji) => {
            if (emoji.count > 1) {
              videoid = results[choice].id;
              setupQueue(default_url + "/watch?v=" + videoid);
            } else {
              choice++;
            }
          })
        )
        .catch();
    }

    if (args.length === 0) {
      return message.reply("Provide a command!");
    }
    if (!channel) {
      return message.reply("You must be in a voice channel!");
    }
    switch (args[0]) {
      case "play":
      case "p": {
        if (!args[1]) {
          return message.reply("Provide a valid link!");
        }
        url = args[1];
        //If a URL starts with a Youtube link, redirect to default instance.
        if (disallowedLinks.some((link) => url.startsWith(link))) {
          message.channel.send("Due to migration to InvidJS, your track will be played using the default Invidious instance for this server.");
          url = default_url + "/watch?v=" + url.split("=")[1];
        }
        //If a string contains just the ID and not a link, redirect to default instance.
        if (url.match(/[a-zA-Z0-9_-]{11}/)) {
          message.channel.send("Your track will be played using the default Invidious instance for this server.");
          url = default_url + "/watch?v=" + url;
        }
        //Add to queue
        setupQueue(url);
        break;
      }
      case "stop": {
        const connection = getVoiceConnection(channel.guild.id);
        if (connection) connection.destroy();
        else return message.channel.send("The bot is already stopped!")
        masterqueue.prepare(`DELETE FROM guild_${id}`).run();
        message.channel.send("Stopped!");
        break;
      }
      case "search":
        {
          if (!args[1]) {
            return message.reply("Provide a valid search query!");
          }
          let query = args.slice(1).join(" ");
          let instance = await InvidJS.fetchInstances({ url: default_url });
          let results = await InvidJS.searchContent(instance[0], query, { limit: 5 });
          sendEmbed(results);
        }
        break;
      case "queue":
      case "q": {
        let embed = new Discord.EmbedBuilder();
        masterqueue
          .prepare(`SELECT * FROM guild_${id}`)
          .all()
          .forEach((track) => {
            embed.addFields({
              name: track.track,
              value: `Requested by: <@!${track.author}>`,
              inline: true,
            });
          });
        embed.setTitle("Queue");
        embed.setColor("#0099ff");
        message.channel.send({ embeds: [embed] });
        break;
      }
      case "skip":
      case "s": {
        const connection = getVoiceConnection(channel.guild.id);
        if (!connection) return message.channel.send("Nothing to skip!")
        masterqueue
          .prepare(`DELETE FROM guild_${id} ORDER BY ROWID LIMIT 1`)
          .run();
        let track = masterqueue
          .prepare(`SELECT * FROM guild_${id} ORDER BY ROWID LIMIT 1`)
          .get();
        if (track || track != undefined) {
          message.channel.send("Skipped!");
          playmusic(channel, track.track, track.author);
        } else {
          message.channel.send("No more tracks to play, disconnecting!");
          if (connection) connection.destroy();
        }
        break;
      }
      case "pause": {
        const connection = getVoiceConnection(channel.guild.id);
        if (!connection) return message.channel.send("Nothing to pause!")
        switch (isPaused) {
          case true: {
            player.unpause();
            isPaused = false;
            return message.channel.send("Unpaused!");
          }
          case false: {
            player.pause();
            isPaused = true;
            return message.channel.send("Paused!");
          }
        }
      }
    }
  },
};
