import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel,
  NoSubscriberBehavior,
} from "@discordjs/voice";
import sqlite3 from "better-sqlite3";
import Discord from "discord.js";
import fs from "fs-extra";
const debug = process.env.DEBUG;
const queue = new sqlite3("./data/queue.db");
const settings = new sqlite3("./data/settings.db");
const cache = new sqlite3("./data/cache.db");

import http from "https";
import path from "path";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { getHash } from "../utils/HashCalculator.js";

const cacheFolder = "../cache/";

const timeouts = new Map();
const players = new Map();
const connections = new Map();

function addToQueue(id, url, name, author) {
  queue
    .prepare(`INSERT INTO guild_${id} VALUES (?, ?, ?, ?)`)
    .run(url, name, author, "false");
}

function removeFromQueue(id) {
  queue.prepare(`DELETE FROM guild_${id} ORDER BY rowid LIMIT 1`).run();
}

function clearQueue(id) {
  queue.prepare(`DELETE FROM guild_${id}`).run();
}

function getFromQueue(id) {
  return queue
    .prepare(`SELECT rowid, * FROM guild_${id} ORDER BY rowid LIMIT 1`)
    .get();
}

function getQueueLength(id) {
  return queue.prepare(`SELECT * FROM guild_${id}`).all().length;
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
  if (!connections.has(interaction.guild.id))
    connections.set(interaction.guild.id, connection);
  return connection;
}

function destroyConnection(id) {
  let connection = getVoiceConnection(id);
  connection.destroy();
  if (connections.has(id)) connections.delete(id);
  return connection;
}

function announceTrack(title, author, interaction) {
  let playingembed = new Discord.EmbedBuilder()
    .setTitle("Now Playing")
    .setDescription(
      `\`${title}\`\n\nRequested by <@!${author}>\n\n` +
        "Use `/controls` to pause, stop or loop the track.",
    );
  interaction.channel.send({ embeds: [playingembed] });
}

async function getLocalFile(file, display_name) {
  let existing_file = cache
    .prepare(`SELECT * FROM files_directory WHERE name = ?`)
    .get(file.name);
  console.log(existing_file);
  if (existing_file !== undefined) return -1;

  return new Promise((resolve, reject) => {
    const download = fs.createWriteStream(
      path.join(__dirname, cacheFolder, file.name),
    );
    http
      .get(file.url, (response) => {
        response.pipe(download);
        download.on("finish", () => {
          download.close(async () => {
            let hash = await getHash(
              path.join(__dirname, cacheFolder, file.name),
            );
            let existing_hash = cache
              .prepare(`SELECT * FROM files_directory WHERE md5Hash = ?`)
              .get(hash);
            if (existing_hash !== undefined) {
              fs.unlink(path.join(__dirname, cacheFolder, file.name), () => {
                resolve(-1);
              });
            } else {
              cache
                .prepare(
                  `INSERT OR IGNORE INTO files_directory VALUES (?, ?, ?)`,
                )
                .run(display_name, file.name, hash);
              resolve(0);
            }
          });
        });
      })
      .on("error", (err) => {
        if (debug === "true") console.log("[DEBUG] Error: " + err.message);
        fs.unlink(path.join(__dirname, cacheFolder, file.name), () => {
          reject(1);
        });
      });
  });
}

function playLocalFile(file, connection, interaction) {
  if (timeouts.get(connection.joinConfig.guildId)) {
    clearTimeout(timeouts.get(connection.joinConfig.guildId));
    timeouts.delete(connection.joinConfig.guildId);
  }
  let player = createAudioPlayer();
  players.set(connection.joinConfig.guildId, player);
  connection.subscribe(player);
  const resource = createAudioResource(path.join(__dirname, cacheFolder, file));
  player.play(resource);
  player.on(AudioPlayerStatus.Idle, async () => {
    if (debug.debug === true) {
      console.log("[DEBUG] No more tracks to play, starting timeout...");
    }
    if (getFromQueue(connection.joinConfig.guildId).isLooped === "false") {
      removeFromQueue(connection.joinConfig.guildId);
    }
    if (getQueueLength(connection.joinConfig.guildId) > 0) {
      if (debug === "true") {
        console.log("[DEBUG] Starting the next track...");
      }
      let file = getFromQueue(connection.joinConfig.guildId);
      playLocalFile(file.name, connection, interaction);
      if (getFromQueue(connection.joinConfig.guildId).isLooped === "false")
        announceTrack(file.track, file.author, interaction);
    } else {
      if (debug === "true") {
        console.log("[DEBUG] No more tracks to play, starting timeout...");
      }
      let timeout =
        parseInt(
          settings
            .prepare(
              `SELECT * FROM guild_${connection.joinConfig.guildId} WHERE option = 'disconnect_timeout'`,
            )
            .get().value,
          10,
        ) * 1000;
      let timer = setTimeout(() => {
        timeouts.delete(connection.joinConfig.guildId);
        players.delete(connection.joinConfig.guildId);
        connections.delete(connection.joinConfig.guildId);
        connection.destroy();
        interaction.channel.send(`No more tracks to play, disconnecting!`);
      }, timeout);
      timeouts.set(connection.joinConfig.guildId, timer);
    }
  });
}

export default {
  addToQueue,
  removeFromQueue,
  getFromQueue,
  getQueueLength,
  clearQueue,
  getConnection,
  destroyConnection,
  getLocalFile,
  playLocalFile,
  announceTrack,
  players,
  connections,
  timeouts,
};
