import {
  ActionRowBuilder,
  ButtonBuilder,
  ChannelType,
  OverwriteResolvable,
  TextChannel,
  VoiceChannel,
} from 'discord.js';

import { inject, injectable } from 'tsyringe';

import { VcOffButton } from '@/components/buttons/VcOffButton';
import { VcOnButton } from '@/components/buttons/VcOnButton';
import { asyncLock } from '@/core/async-lock';
import { type IVoiceService } from '@/services/Voice';
import { prisma } from '@/core/prisma';
import { IMinecraftService } from '@/services/Minecraft';

interface IRoomService {
  syncRoom(voiceChannel: VoiceChannel): Promise<void>;
  setVoice(voiceChannel: VoiceChannel, voice: boolean): Promise<void>;
  getTextChannel(voiceChannel: VoiceChannel): Promise<TextChannel | undefined>;
  getVoiceChannel(textChannel: TextChannel): Promise<VoiceChannel | undefined>;
}

@injectable()
class RoomService implements IRoomService {
  constructor(
    @inject('IVoiceService') private voiceService: IVoiceService,
    @inject('IMinecraftService') private minecraftService: IMinecraftService
  ) {}

  async syncRoom(voiceChannel: VoiceChannel) {
    if (voiceChannel.guild.afkChannelId === voiceChannel.id) {
      console.log('[Room] The VoiceChannel is AfkChannel.');
      return;
    }

    const isVoiceChannelUsed = this.isVoiceChannelUsed(voiceChannel);

    await asyncLock.acquire(voiceChannel.id, async () => {
      const room = await prisma.room.findUnique({
        where: {
          voiceChannelId: voiceChannel.id,
        },
      });

      if (!room || !room.textChannelId) {
        if (!isVoiceChannelUsed) {
          console.log(
            '[Room] There is no text channel corresponding to the voice channel.',
          );
          return;
        }
      }

      let textChannel: TextChannel | undefined = undefined;
      if (room && room.textChannelId) {
        try {
          const channel = await voiceChannel.guild.channels.fetch(
            room.textChannelId,
          );
          if (channel) textChannel = channel as TextChannel;
        } catch (e) {}
      }
      if (!textChannel && !isVoiceChannelUsed) {
        console.log(
          '[Room] There is no text channel corresponding to the voice channel.',
        );
        return;
      }
      if (!textChannel) {
        console.log(
          '[Room] Create a text channel corresponding to the voice channel as it does not exist.',
        );
        //  テキストチャンネルを作成
        const permissionOverwrites: OverwriteResolvable[] = voiceChannel.members
          .filter((member) => member.user.bot)
          .map((member) => ({
            id: member,
            allow: ['ViewChannel'],
          }));
        permissionOverwrites.push({
          id: voiceChannel.guild.roles.everyone,
          deny: ['ViewChannel'],
        });
        textChannel = await voiceChannel.guild.channels.create({
          name: '通話用テキストチャンネル',
          topic: `${voiceChannel.name} に入室しているメンバーにのみ表示されるテキストチャンネル.`,
          type: ChannelType.GuildText,
          parent: voiceChannel.parent,
          permissionOverwrites: permissionOverwrites,
        });
        await textChannel.send({
          content: `このチャンネルは${voiceChannel.url}に入っている人だけに表示されます`,
        });
        await textChannel.send({
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents([
              room?.voice
                ? await VcOffButton.generate()
                : await VcOnButton.generate(),
            ]),
          ],
        });
      }

      console.log(
        `[Room] Sync VoiceChannel and TextChannel. ${voiceChannel.name}@${voiceChannel.guild.name}`,
      );
      await this.syncMembers(voiceChannel, textChannel);

      if (!isVoiceChannelUsed) {
        await textChannel.delete();
        this.voiceService.disconnect(voiceChannel);
      } else {
        if (room?.voice) {
          this.voiceService.connect(voiceChannel);
        }
      }

      if (!room)
        await prisma.room.create({
          data: {
            guildId: voiceChannel.guildId,
            voiceChannelId: voiceChannel.id,
            textChannelId: isVoiceChannelUsed ? textChannel.id : null,
            voice: false,
          },
        });
      else
        await prisma.room.update({
          where: {
            roomId: room.roomId,
          },
          data: {
            textChannelId: isVoiceChannelUsed ? textChannel.id : null,
          },
        });
    });
  }

  async setVoice(voiceChannel: VoiceChannel, voice: boolean) {
    const room = await prisma.room.findUnique({
      where: {
        voiceChannelId: voiceChannel.id,
      },
    });

    if (!room)
      await prisma.room.create({
        data: {
          roomId: undefined,
          guildId: voiceChannel.guildId,
          voiceChannelId: voiceChannel.id,
          textChannelId: null,
          voice: voice,
        },
      });
    else
      await prisma.room.update({
        where: {
          roomId: room.roomId,
        },
        data: {
          voice: voice,
        },
      });
  }

  private isVoiceChannelUsed(voiceChannel: VoiceChannel) {
    return !!voiceChannel.members.find((member) => !member.user.bot);
  }

  private async syncMembers(
    voiceChannel: VoiceChannel,
    textChannel: TextChannel,
  ) {
    //  テキストチャンネルに入っていないメンバーをテキストチャンネルに追加
    const joinMembers = voiceChannel.members.filter((vMember) => !textChannel.members.has(vMember.id));
    await Promise.all(
      joinMembers.map((vMember) =>
          textChannel.permissionOverwrites.create(vMember, {
            ViewChannel: true,
            ReadMessageHistory: true,
          }),
        ),
    );

    //  ボイスチャンネルに入っていないメンバーをテキストチャンネルから削除
    await Promise.all(
      textChannel.members
        .filter((tMember) => !tMember.user.bot)
        .filter((tMember) => !voiceChannel.members.has(tMember.id))
        .map((tMember) => textChannel.permissionOverwrites.delete(tMember)),
    );

    if (joinMembers.size > 0)
      await this.minecraftService.send('といといほー', `🔊${voiceChannel.name}に${voiceChannel.members.size}人入室しています`);
  }

  async getTextChannel(voiceChannel: VoiceChannel) {
    const room = await prisma.room.findUnique({
      where: {
        voiceChannelId: voiceChannel.id,
      },
    });

    if (!room || !room.textChannelId) return undefined;

    const channel = await voiceChannel.guild.channels.fetch(room.textChannelId);
    if (!channel) return undefined;

    return channel as TextChannel;
  }

  async getVoiceChannel(textChannel: TextChannel) {
    const room = await prisma.room.findUnique({
      where: {
        textChannelId: textChannel.id,
      },
    });

    if (!room) return undefined;

    const channel = await textChannel.guild.channels.fetch(room.voiceChannelId);
    if (!channel) return undefined;

    return channel as VoiceChannel;
  }
}

export { type IRoomService, RoomService };
