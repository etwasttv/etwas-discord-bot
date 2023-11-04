import { GuildMember, Snowflake, VoiceChannel } from "discord.js";
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

export async function joinVC(voiceChannel: VoiceChannel) {
  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guildId,
    group: voiceChannel.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });

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

  const player = createAudioPlayer();
  connection.subscribe(player);
  players.set(voiceChannel.id, player);
}

export async function checkSelfYomiage(guildMember: GuildMember) {
  const member = await prisma.member.findUnique({
    where: {
      id: guildMember.id,
    }
  });
  return member && member.useZunda;
}

export async function turnOnSelfYomiage(guildMember: GuildMember) {
  await prisma.member.upsert({
    where: {
      id: guildMember.id,
    },
    update: {
      useZunda: true,
    },
    create: {
      id: guildMember.id,
      useZunda: true,
    }
  });
}

export async function turnOffSelfYomiage(guildMember: GuildMember) {
  await prisma.member.upsert({
    where: {
      id: guildMember.id,
    },
    update: {
      useZunda: false,
    },
    create: {
      id: guildMember.id,
      useZunda: false,
    },
  });
}

export async function readText(voiceChannel: VoiceChannel, text: string) {
  const query = await httpAsync.request(
    `${ENDPOINT}/audio_query?speaker=1&text=${encodeURIComponent(text)}`,
    {
      method: 'POST'
    }, null);

  const buffer = await httpAsync.request(
    `${ENDPOINT}/synthesis?speaker=1`,
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

export async function leaveVC(voiceChannel: VoiceChannel) {
  const connection = getVoiceConnection(voiceChannel.guildId, voiceChannel.id);
  if (connection) connection.destroy();

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

  const player = players.get(voiceChannel.id);
  if (player) {
    players.delete(voiceChannel.id);
    player.stop();
  }
}
