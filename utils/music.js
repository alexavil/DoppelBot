import Discord, { ButtonStyle } from "discord.js";
const debug = process.env.DEBUG;
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  getVoiceConnection,
  AudioPlayerStatus,
} from "@discordjs/voice";
import sqlite3 from "better-sqlite3";
const queue = new sqlite3("./data/queue.db");
const settings = new sqlite3("./data/settings.db");

function addToQueue(id, url, name, author) {
  queue
    .prepare(`INSERT INTO guild_${id} VALUES (?, ?, ?, ?)`)
    .run(url, name, author, "false");
}

function removeFromQueue(id) {
  masterqueue.prepare(`DELETE FROM guild_${id} ORDER BY rowid LIMIT 1`).run();
}

function getFromQueue(id) {
  return masterqueue
    .prepare(`SELECT rowid, * FROM guild_${id} ORDER BY rowid LIMIT 1`)
    .get();
}

function getQueueLength(id) {
  return masterqueue.prepare(`SELECT * FROM guild_${id}`).all().length;
}

function getConnection(interaction) {
  let connection = undefined;
  if (getVoiceConnection(interaction.guild.id) === undefined) {
    connection = joinVoiceChannel({
      channelId: interaction.member.voice.channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });
  } else connection = getVoiceConnection(interaction.guild.id);
  return connection;
}


function announceTrack(title, author, interaction) {
    let playingembed = new Discord.EmbedBuilder()
      .setTitle("Now Playing")
      .setDescription(
        `${title}\n\nRequested by <@!${author}>\n\n` +
          "Use `/controls` to pause, stop or loop the track.",
      )
    interaction.channel.send({ embeds: [playingembed] });
}

function playLocalFile(file, connection) {
        let player = createAudioPlayer();
        connection.subscribe(player);
        const resource = createAudioResource(file.url);
        player.play(resource);
        player.on(AudioPlayerStatus.Idle, async () => {
            if (debug.debug === true) {
              console.log("[DEBUG] No more tracks to play, starting timeout...");
            }
        });
}

export default {
    addToQueue,
    removeFromQueue,
    getFromQueue,
    getQueueLength,
    getConnection,
    playLocalFile,
    announceTrack,
};