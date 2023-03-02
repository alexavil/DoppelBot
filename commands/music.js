const Discord = require("discord.js");
const youtube = require("play-dl");
const play = require("play-dl");
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
let allowedLinks = [
  "https://www.youtube.com",
  "https://youtu.be",
  "https://soundcloud.com",
];

module.exports = {
  name: "music",
  description: "Music control",
  aliases: ["m"],
  async execute(message, args) {
    const id = message.guild.id;
    let url = "";
    let channel = message.member.voice.channel;

    async function streamCheck(url) {
      let stream = undefined;
      try {
        stream = await youtube.stream(url);
      } catch (error) {
        if (error.message.includes("Sign in to confirm your age")) {
          message.channel.send("Error: The video is age-restricted.");
          return undefined;
        }
        message.channel.send("Error: The video could not be fetched correctly.");
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
      if (url.startsWith(allowedLinks[2])) {
        await play.getFreeClientID().then((clientID) =>
          play.setToken({
            soundcloud: {
              client_id: clientID,
            },
          })
        );
      }
      player = createAudioPlayer();
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
      });
      message.channel.send(`Now playing: ${url}\nRequested by <@!${author}>`);
      player.play(resource);
      connection.subscribe(player);
      console.log(timerId);
      if (timerId !== undefined) clearTimeout(timerId);
      player.on(AudioPlayerStatus.Idle, () => {
        masterqueue
          .prepare(`DELETE FROM guild_${id} ORDER BY ROWID LIMIT 1`)
          .run();
        let track = masterqueue
          .prepare(`SELECT * FROM guild_${id} ORDER BY ROWID LIMIT 1`)
          .get();
        console.log(track);
        if ((track || track != undefined)) {
          playmusic(channel, track.track, track.author);
        } else {
          timerId = setTimeout(() => {
            message.channel.send("No more tracks to play, disconnecting!");
            if (connection) connection.destroy();
          }, parseInt(settings.prepare(`SELECT * FROM guild_${id} WHERE option = 'disconnect_timeout'`).get().value) * 1000);
        }
      });
    }

    async function sendEmbed(yt_info) {
      let searchembed = new Discord.EmbedBuilder();
      yt_info.forEach((track) => {
        searchembed.addFields({
          name: track.url,
          value: track.title,
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
            console.log(emoji.count);
            if (emoji.count > 1) {
              url = yt_info[choice].url;
              setupQueue(url);
            } else {
              choice++;
            }
          })
        )
        .catch(console.error);
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
        console.log(url);
        //If URL doesn't include any of the allowed links, return error
        if (!allowedLinks.some((link) => url.startsWith(link))) {
          return message.reply("Provide a valid link!");
        }
        //Add to queue
        setupQueue(url);
        break;
      }
      case "stop": {
        const connection = getVoiceConnection(channel.guild.id);
        if (connection) connection.destroy();
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
          console.log(query);
          let yt_info = await youtube.search(query, { limit: 5 });
          sendEmbed(yt_info);
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
        masterqueue
          .prepare(`DELETE FROM guild_${id} ORDER BY ROWID LIMIT 1`)
          .run();
        let track = masterqueue
          .prepare(`SELECT * FROM guild_${id} ORDER BY ROWID LIMIT 1`)
          .get();
        console.log(track);
        if (track || track != undefined) {
          message.channel.send("Skipped!");
          playmusic(channel, track.track, track.author);
        } else {
          message.channel.send("No more tracks to play, disconnecting!");
          const connection = getVoiceConnection(channel.guild.id);
          if (connection) connection.destroy();
        }
        break;
      }
      case "pause": {
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
