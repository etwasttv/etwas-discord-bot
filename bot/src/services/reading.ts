import { Snowflake, VoiceChannel } from "discord.js";
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

const ENDPOINT = 'http://voicevox:50021';

const players = new Map<Snowflake, AudioPlayer>();

export function joinVC(voiceChannel: VoiceChannel) {
  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guildId,
    group: voiceChannel.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });

  const player = createAudioPlayer();
  connection.subscribe(player);
  players.set(voiceChannel.id, player);
}

export async function turnOnVc(voiceChannel: VoiceChannel) {
  await prisma.room.upsert({
    where: {
      voiceChannelId: voiceChannel.id,
    },
    update: {
      useZundamon: true,
    },
    create: {
      voiceChannelId: voiceChannel.id,
      useZundamon: true,
    }
  });
  if (!hasConnection(voiceChannel)) joinVC(voiceChannel);
}

export async function turnOffVc(voiceChannel: VoiceChannel) {
  await prisma.room.upsert({
    where: {
      voiceChannelId: voiceChannel.id,
    },
    update: {
      useZundamon: false,
    },
    create: {
      voiceChannelId: voiceChannel.id,
      useZundamon: false,
    }
  });

  if (hasConnection(voiceChannel)) leaveVC(voiceChannel);
}

export async function readText(
  voiceChannel: VoiceChannel,
  text: string,
  speakerId?: number,
  speedScale?: number,
  pitchScale?: number,
  intonationScale?: number,
) {

  if (!hasConnection(voiceChannel)) joinVC(voiceChannel);

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
  const player = players.get(voiceChannel.id);
  if (!player) return;

  player.play(createAudioResource(Readable.from(buffer)));
}

export function hasConnection(voiceChannel: VoiceChannel) {
  const connection = getVoiceConnection(voiceChannel.guildId, voiceChannel.id);
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

export function leaveVC(voiceChannel: VoiceChannel) {
  const connection = getVoiceConnection(voiceChannel.guildId, voiceChannel.id);
  if (connection) connection.destroy();

  const player = players.get(voiceChannel.id);
  if (player) {
    players.delete(voiceChannel.id);
    player.stop();
  }
}
