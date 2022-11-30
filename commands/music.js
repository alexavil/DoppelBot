const Discord = require("discord.js");
const youtube = require("play-dl");
const { authorization } = require("play-dl");
const play = require("play-dl");
const {
  AudioPlayerStatus,
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
} = require("@discordjs/voice");
const sqlite3 = require("better-sqlite3");
module.exports = {
  name: "music",
  description: "Music control",
  aliases: ["m"],
  async execute(message, args) {
    let queue = new sqlite3("./queue.db");
    id = message.guild.id;
    let url = "";
    let player = undefined;
    let allowedLinks = [
      "https://www.youtube.com",
      "https://youtu.be",
      "https://soundcloud.com",
    ];
    let channel = message.member.voice.channel;
    async function playmusic(channel, url, pos, author) {
      currentpos = pos;
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
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
      let stream = await youtube.stream(url);
      player = createAudioPlayer();
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
      });
      const subscription = connection.subscribe(player);
      message.channel.send(`Now playing: ${url}\nRequested by <@!${author}>`);
      player.play(resource);
      player.on(AudioPlayerStatus.Idle, () => {
        queue.prepare(`DELETE FROM guild_${id} WHERE rowid = ${pos}`).run();
        pos++;
        var track = queue
          .prepare(`SELECT * FROM guild_${id} WHERE rowid = ${pos}`)
          .get();
        console.log(track);
        if (track || track != undefined) {
          playmusic(channel, track.track, pos, track.author);
        } else {
          connection.destroy();
        }
      });
    }
    if (args.length == 0) {
      return message.reply("Provide a command!");
    }
    if (!channel) {
      return message.reply("You must be in a voice channel!");
    }
    switch (args[0]) {
      case "play":
        if (!args[1]) {
          return message.reply("Provide a valid link!");
        }
        url = args[1];
        console.log(url);
        //If URL doesn't include any of the allowed links, return error
        if (!allowedLinks.some((link) => url.startsWith(link))) {
          return message.reply("Provide a valid link!");
        } else {
          message.delete().catch();
        }
        //Add to queue
        queue
          .prepare(`INSERT INTO guild_${id} VALUES (?, ?)`)
          .run(url, message.author.id);
        queue = queue.prepare(`SELECT * FROM guild_${id}`).all();
        console.log(queue.length);
        if (queue.length === 1) {
          playmusic(channel, url, 1, message.author.id);
        } else {
          message.channel.send("Added " + url + " to queue!");
        }
        break;
      case "stop":
        const connection = getVoiceConnection(channel.guild.id);
        if (connection) connection.destroy();
        queue.prepare(`DELETE FROM guild_${id}`).run();
        message.channel.send("Stopped!");
        break;
      case "search":
        if (!args[1]) {
          return message.reply("Provide a valid search query!");
        }
        let query = args.slice(1).join(" ");
        console.log(query);
        let yt_info = await youtube.search(query, { limit: 5 });
        async function sendEmbed() {
          let searchembed = new Discord.MessageEmbed();
          yt_info.forEach((track) => {
            searchembed.addFields({
              name: track.url,
              value: track.title,
              inline: false,
            });
          });
          searchembed.setTitle("Please select a track:");
          searchembed.setColor("#0099ff");
          var embedmessage = await message.channel.send({
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
          var choice = 0;
          embedmessage
            .awaitReactions({ filter, maxUsers: 2 })
            .then((collected) =>
              collected.forEach((emoji) => {
                console.log(emoji.count);
                if (emoji.count > 1) {
                  url = yt_info[choice].url;
                  queue
                    .prepare(`INSERT INTO guild_${id} VALUES (?, ?)`)
                    .run(url, message.author.id);
                  queue = queue.prepare(`SELECT * FROM guild_${id}`).all();
                  console.log(queue.length);
                  if (queue.length == 1) {
                    playmusic(channel, url, 1, message.author.id);
                  } else {
                    message.channel.send("Added " + url + " to queue!");
                  }
                } else {
                  choice++;
                }
              })
            )
            .catch(console.error);
        }
        sendEmbed();
        break;
      case "queue":
        queue = queue.prepare(`SELECT * FROM guild_${id}`).all();
        let embed = new Discord.MessageEmbed();
        queue.forEach((track) => {
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
      case "skip":
        queue.prepare(`DELETE FROM guild_${id} ORDER BY ROWID LIMIT 1`).run();
        message.channel.send("Skipped!");
        var track = queue
          .prepare(`SELECT * FROM guild_${id} ORDER BY ROWID LIMIT 1`)
          .get();
        console.log(track);
        if (track || track != undefined) {
          playmusic(channel, track.track, track.rowid, track.author);
        } else {
          const connection = getVoiceConnection(channel.guild.id);
          if (connection) connection.destroy();
        }
        break;
    }
  },
};
