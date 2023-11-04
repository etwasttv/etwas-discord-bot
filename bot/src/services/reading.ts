import { Client, Snowflake, VoiceChannel } from "discord.js";
import {
  AudioPlayer,
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
} from '@discordjs/voice';

import httpAsync from '../lib/http-async';
import { Readable } from "stream";
import { prisma } from "../lib/prisma";
import { CLIENTS } from "..";

const CLIENT_CONNECTIONS = new Map<Snowflake, Set<Snowflake>>();
const WAITING_QUEUE = new Map<Snowflake, Array<Snowflake>>();

const ENDPOINT = 'http://voicevox:50021';

const players = new Map<Snowflake, AudioPlayer>();

function getFreeClient(guildId: Snowflake) {
  const usedClients = CLIENT_CONNECTIONS.get(guildId);
  if (!usedClients) {
    const client = CLIENTS.find(c => c.user?.id);
    if (!client || !client.user) return null;
    CLIENT_CONNECTIONS.set(guildId, new Set([client.user.id]));
    return client;
  }

  for (const client of CLIENTS) {
    if (!client.user) continue;
    if (usedClients.has(client.user.id)) continue;
    usedClients.add(client.user.id);
    return client;
  }
}

export async function joinVC(voiceChannelId: string, guildId: string) {
  const client = getFreeClient(guildId);

  if (!client || !client.user){
    addWaitingQueue(voiceChannelId, guildId);
    throw new Error('bot busy');
  }

  const guild = await client.guilds.fetch(guildId);

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

  const query = await httpAsync.request(
    `${ENDPOINT}/audio_query?speaker=${speakerId??3}&text=${encodeURIComponent(text)}`,
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
  const player = players.get(voiceChannelId);
  if (!player) return;

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
  const usedClients = CLIENT_CONNECTIONS.get(guildId);
  if (usedClients && client.user) {
    usedClients.delete(client.user.id);
  }
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
  } else {
    if (queue.every(v => v !== voiceChannelId)) {
      queue.push(voiceChannelId);
    }
  }
}

function getWaitingQueue(guildId: Snowflake) {
  const queue = WAITING_QUEUE.get(guildId);
  return queue?.shift();
}
