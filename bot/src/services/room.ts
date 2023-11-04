import AsyncLock from 'async-lock';
import {
  ChannelType,
  GuildBasedChannel,
  GuildMember,
  OverwriteResolvable,
  PermissionsBitField,
  Role,
  Snowflake,
  TextChannel,
  VoiceChannel
} from 'discord.js';
import { prisma } from '../lib/prisma';
import { Room } from '@prisma/client';
import { leaveVC } from './reading';
import { truncate } from 'fs';

const LOCK = new AsyncLock();

export async function sendTextToRoom(voiceChannel: VoiceChannel, text: string) {
  const room = await prisma.room.findUnique({
    where: {
      voiceChannelId: voiceChannel.id,
    }
  });

  if (!room || !room.textChannelId) return;

  const textChannel = <TextChannel>await voiceChannel.guild.channels.fetch(room.textChannelId);
  if (!textChannel) return;
  textChannel.send(text);
}

export async function joinMember(
  voiceChannel: VoiceChannel,
  guildMember: GuildMember
) {
  await LOCK.acquire(voiceChannel.id, async () => {
    await prisma.$transaction(async tx => {
      const member = await tx.member.upsert({
        where: {
          id: guildMember.id,
        },
        create: {
          id: guildMember.id,
          room: {
            connectOrCreate: {
              where: {
                voiceChannelId: voiceChannel.id,
              },
              create: {
                voiceChannelId: voiceChannel.id,
              },
            },
          },
        },
        update: {
          room: {
            connectOrCreate: {
              where: {
                voiceChannelId: voiceChannel.id,
              },
              create: {
                voiceChannelId: voiceChannel.id,
              },
            },
          },
        },
        include: {
          room: true
        },
      });

      if (!member || !member.room) throw new Error('DB Error');

      const {textChannel, role} = await findOrCreateRoom(
        member.room,
        voiceChannel
      );

      await guildMember.roles.add(role);

      await tx.room.update({
        where: {
          voiceChannelId: voiceChannel.id,
        },
        data: {
          textChannelId: textChannel.id,
          roleId: role.id,
        },
      });
    });
  });
}

export async function leaveMember(
  voiceChannel: VoiceChannel,
  guildMember: GuildMember
) {
  await LOCK.acquire(voiceChannel.id, async () => {
    await prisma.$transaction(async tx => {
      const member = await tx.member.findUnique({
        where: {
          id: guildMember.id,
        },
        include: {
          room: true,
        },
      });

      if (!member || !member.room) return;

      const tasks: Promise<any>[] = [];

      tasks.push(tx.member.update({
        where: {
          id: guildMember.id,
        },
        data: {
          roomId: null,
        },
      }));

      let roleTask: Promise<Role|null>|undefined = undefined;
      if (member.room.roleId)
        roleTask = voiceChannel.guild.roles.fetch(member.room.roleId);

      const deleteRoom
        = voiceChannel.members.every(m => m.user.bot || m === guildMember);

      let textChannelTask: Promise<GuildBasedChannel|null>|undefined
        = undefined;
      if (deleteRoom) {
        if (member.room.textChannelId) {
          textChannelTask
            = voiceChannel.guild.channels.fetch(member.room.textChannelId);
        }
      }

      const [textChannel, role]
        = await Promise.all([textChannelTask, roleTask]);

      if (deleteRoom) {
        leaveVC(voiceChannel);
        if (textChannel) tasks.push(textChannel.delete());
        if (role) tasks.push(role.delete());
        tasks.push(tx.room.update({
          where: {
            voiceChannelId: voiceChannel.id,
          },
          data: {
            textChannelId: null,
            roleId: null,
          },
        }));
      } else {
        if (role) tasks.push(guildMember.roles.remove(role));
      }
      await Promise.all(tasks);
    });
  });
}

async function findOrCreateRoom(room: Room, voiceChannel: VoiceChannel) {
  const textChannelTask = findOrCreateRoomTextChannel(
    room.textChannelId,
    voiceChannel,
  );
  const roleTask = findOrCreateRoomRole(
    room.roleId,
    voiceChannel,
  );
  const [textChannel, role] = await Promise.all([textChannelTask, roleTask]);

  await textChannel.permissionOverwrites.edit(role, {
    ViewChannel: true,
    SendMessages: true,
    SendMessagesInThreads: true,
    CreatePublicThreads: true,
    EmbedLinks: true,
    AttachFiles: true,
    AddReactions: true,
    UseExternalEmojis: true,
    UseExternalStickers: true,
    MentionEveryone: true,
    ReadMessageHistory: true,
    UseApplicationCommands: true,
    SendVoiceMessages: true,
  });

  return {textChannel, role};
}

async function findOrCreateRoomTextChannel(
  textChannelId: Snowflake|null,
  voiceChannel: VoiceChannel,
) {
  if (!textChannelId) return createRoomTextChannel(voiceChannel);

  const channels = await voiceChannel.guild.channels.fetch();
  return <TextChannel>channels.get(textChannelId)
      ?? await createRoomTextChannel(voiceChannel);
}

async function createRoomTextChannel(voiceChannel: VoiceChannel) {
  const permissionOverwrites = new Array<OverwriteResolvable>({
    id: voiceChannel.guild.roles.everyone,
    deny: [
      PermissionsBitField.Flags.ViewChannel,
    ]
  });

  const guildMembers = await voiceChannel.guild.members.fetch();
  guildMembers.filter(member => member.user.bot)
      .forEach((bot, _id) => permissionOverwrites.push({
        id: bot,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.SendMessagesInThreads,
          PermissionsBitField.Flags.CreatePublicThreads,
          PermissionsBitField.Flags.EmbedLinks,
          PermissionsBitField.Flags.AttachFiles,
          PermissionsBitField.Flags.AddReactions,
          PermissionsBitField.Flags.UseExternalEmojis,
          PermissionsBitField.Flags.UseExternalStickers,
          PermissionsBitField.Flags.MentionEveryone,
          PermissionsBitField.Flags.ReadMessageHistory,
          PermissionsBitField.Flags.UseApplicationCommands,
          PermissionsBitField.Flags.SendVoiceMessages,
        ]
      }));

  return voiceChannel.guild.channels.create({
    name: `${voiceChannel.name}のためのTextChannnel`,
    type: ChannelType.GuildText,
    permissionOverwrites: permissionOverwrites,
    parent: voiceChannel.parent,
  });
}

async function findOrCreateRoomRole(
  roleId: Snowflake|null,
  voiceChannel: VoiceChannel
) {
  if (!roleId) return createRoomRole(voiceChannel);
  const role = await voiceChannel.guild.roles.fetch(roleId);
  return role ?? await createRoomRole(voiceChannel);
}

async function createRoomRole(voiceChannel: VoiceChannel) {
  return voiceChannel.guild.roles.create({
    name: `${voiceChannel.name} member`,
    reason: `${voiceChannel.name} member`
  });
}
