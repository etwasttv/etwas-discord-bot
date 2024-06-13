import { prisma } from '@/core/prisma';
import { RoomConfig } from '@/entities';
import { injectable } from 'tsyringe';

interface IRoomConfigRepository {
  create(roomConfig: RoomConfig): Promise<void>;
  update(roomConfig: RoomConfig): Promise<void>;
  findByVoiceChannelId(voiceChannelId: string): Promise<RoomConfig|null>;
  findByTextChannelId(textChannelId: string): Promise<RoomConfig|null>;
}

@injectable()
class RoomConfigRepository implements IRoomConfigRepository {
  async create(roomConfig: RoomConfig): Promise<void> {
    await prisma.room.create({
      data: {
        guildId: roomConfig.guildId,
        voiceChannelId: roomConfig.voiceChannelId,
        textChannelId: roomConfig.textChannelId,
        voice: roomConfig.voice,
      }
    });
  }

  async update(roomConfig: RoomConfig): Promise<void> {
    await prisma.room.update({
      where: {
        roomId: roomConfig.roomId,
      },
      data: {
        guildId: roomConfig.guildId,
        voiceChannelId: roomConfig.voiceChannelId,
        textChannelId: roomConfig.textChannelId,
        voice: roomConfig.voice,
      }
    });
  }

  async findByVoiceChannelId(voiceChannelId: string): Promise<RoomConfig|null> {
    const config = await prisma.room.findUnique({
      where: {
        voiceChannelId: voiceChannelId,
      }
    });

    if (!config)
      return null;

    return new RoomConfig(config.roomId, config.guildId, config.voiceChannelId, config.textChannelId ?? null, config.voice);
  }

  async findByTextChannelId(textChannelId: string): Promise<RoomConfig|null> {
    const config = await prisma.room.findUnique({
      where: {
        textChannelId: textChannelId,
      }
    });

    if (!config)
      return null;

    return new RoomConfig(config.roomId, config.guildId, config.voiceChannelId, config.textChannelId ?? null, config.voice);
  }
}

export { type IRoomConfigRepository, RoomConfigRepository }
