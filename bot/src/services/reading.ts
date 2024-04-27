import { Client, Snowflake, VoiceChannel } from "discord.js";
import {
  AudioPlayer,
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  AudioPlayerStatus,
} from '@discordjs/voice';

import httpAsync from '../lib/http-async';
import { Readable } from "stream";
import { prisma } from "../lib/prisma";
import { CLIENTS } from "..";

const CLIENT_CONNECTIONS = new Map<Snowflake, Set<Snowflake>>();
const WAITING_QUEUE = new Map<Snowflake, Array<Snowflake>>();

const ENDPOINT = 'http://127.0.0.1:50021';

const players = new Map<Snowflake, AudioPlayer>();

function getFreeClient(guildId: Snowflake) {
  const usedClients = CLIENT_CONNECTIONS.get(guildId);
  if (!usedClients) {
    const client = CLIENTS.find(c => c.user?.id);
    if (!client || !client.user) return null;
    CLIENT_CONNECTIONS.set(guildId, new Set([client.user.id]));
    console.log(`[LOG] ${client.user.id}@${guildId} in use`);
    return client;
  }

  for (const client of CLIENTS) {
    if (!client.user) continue;
    if (usedClients.has(client.user.id)) continue;
    usedClients.add(client.user.id);
    console.log(`[LOG] ${client.user.id}@${guildId} in use`);
    return client;
  }
}

function releaseClient(guildId: Snowflake, clientId: Snowflake) {
  const usedClients = CLIENT_CONNECTIONS.get(guildId);
  if (!usedClients) return;
  usedClients.delete(clientId);
  console.log(`[LOG] ${clientId}@${guildId} release`);
}

export async function joinVC(voiceChannelId: string, guildId: string) {
  const client = getFreeClient(guildId);

  if (!client || !client.user){
    addWaitingQueue(voiceChannelId, guildId);
    throw new Error('bot busy');
  }

  const guild0 = await CLIENTS[0].guilds.fetch(guildId);
  const guild = await client.guilds.fetch(guildId);
  const voiceChannel = <VoiceChannel>(await guild0.channels.fetch(voiceChannelId));
  if (voiceChannel.members.every(m => m.user.bot)) {
    releaseClient(guildId, client.user.id);
    return;
  }

  const connection = joinVoiceChannel({
    channelId: voiceChannelId,
    guildId: guildId,
    group: voiceChannelId,
    adapterCreator: guild.voiceAdapterCreator,
  });

  const player = createAudioPlayer();
  connection.subscribe(player);
  players.set(voiceChannelId, player);
}

export async function turnOnVc(voiceChannelId: Snowflake, guildId: Snowflake) {
  await prisma.room.upsert({
    where: {
      voiceChannelId: voiceChannelId,
    },
    update: {
      useZundamon: true,
    },
    create: {
      voiceChannelId: voiceChannelId,
      useZundamon: true,
    }
  });
  if (!hasConnection(voiceChannelId, guildId)) await joinVC(voiceChannelId, guildId);
}

export async function turnOffVc(voiceChannelId: Snowflake, guildId: Snowflake) {
  await prisma.room.upsert({
    where: {
      voiceChannelId: voiceChannelId,
    },
    update: {
      useZundamon: false,
    },
    create: {
      voiceChannelId: voiceChannelId,
      useZundamon: false,
    }
  });

  if (hasConnection(voiceChannelId, guildId)) await leaveVC(voiceChannelId, guildId);
}

const URL = new RegExp('https?://[\\w!?/+\\-_~;.,*&@#=$%()\'[\\]]+', 'g');

export async function readText(
  voiceChannelId: Snowflake,
  guildId: Snowflake,
  text: string,
  speakerId?: number,
  speedScale?: number,
  pitchScale?: number,
  intonationScale?: number,
) {

  if (!hasConnection(voiceChannelId, guildId)) await joinVC(voiceChannelId, guildId);

  const fixedText = text.replaceAll(URL, 'URL省略');

  const query = await httpAsync.request(
    `${ENDPOINT}/audio_query?speaker=${speakerId??3}&text=${encodeURIComponent(fixedText)}`,
    {
      method: 'POST'
    }, null);

  const queryJson = JSON.parse(query.toString());
  if (speedScale) queryJson['speedScale'] = speedScale;
  if (pitchScale) queryJson['pitchScale'] = pitchScale;
  if (intonationScale) queryJson['intonationScale'] = intonationScale;

  const buffer = await httpAsync.request(
    `${ENDPOINT}/synthesis?speaker=${speakerId??3}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(query),
      },
    }, query);
  let player = players.get(voiceChannelId);
  if (!player) {
    const connection = getVoiceConnection(guildId, voiceChannelId);
    player = createAudioPlayer();
    if (!connection) {
      console.log('[LOG] no connection');
      return;
    }
    if (!connection.subscribe(player)) {
      console.log('[LOG] unable subscribe');
      return;
    }
    players.set(voiceChannelId, player);
  }
  player.play(createAudioResource(Readable.from(buffer)));
}

export function hasConnection(voiceChannelId: Snowflake, guildId: Snowflake) {
  const connection = getVoiceConnection(guildId, voiceChannelId);
  return !!connection;
}

export async function isOnZundamon(voiceChannel: VoiceChannel) {
  const room = await prisma.room.findUnique({
    where: {
      voiceChannelId: voiceChannel.id,
    }
  });
  return room && room.useZundamon;
}

export async function leaveVC(voiceChannelId: Snowflake, guildId: Snowflake) {
  const connection = getVoiceConnection(guildId, voiceChannelId);
  if (connection) connection.destroy();

  const player = players.get(voiceChannelId);
  if (player) {
    players.delete(voiceChannelId);
    player.stop();
  }
}

export async function handleLeaveVC(client: Client, guildId: Snowflake) {
  if (client.user)
    releaseClient(guildId, client.user.id);
  const next = getWaitingQueue(guildId);
  if (next) {
    await joinVC(next, guildId);
  }
}

function addWaitingQueue(voiceChannelId: Snowflake, guildId: Snowflake) {
  let queue = WAITING_QUEUE.get(guildId);
  if (!queue) {
    queue = new Array<Snowflake>(voiceChannelId);
    WAITING_QUEUE.set(guildId, queue);
    console.log(`[LOG] ${voiceChannelId}@${guildId} push queue`);
  } else {
    if (!queue.find(v => v === voiceChannelId)) {
      queue.push(voiceChannelId);
      console.log(`[LOG] ${voiceChannelId}@${guildId} push queue`);
    }
    console.log(`[LOG] ${voiceChannelId}@${guildId} exist in queue`);
  }
}

function getWaitingQueue(guildId: Snowflake) {
  const queue = WAITING_QUEUE.get(guildId);
  return queue?.shift();
}
