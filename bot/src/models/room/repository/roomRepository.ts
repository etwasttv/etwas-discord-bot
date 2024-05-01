import { prisma } from '@/lib/prisma';
import { Room } from '@/models/room/entity/room';
import { VoiceChannelId } from '@/models/room/valueObject/voiceChannelId';
import { VoiceChannelName } from '@/models/room/valueObject/voiceChannelName';
import { GuildId } from '@/models/guild/valueObject/guildId';
import { TextChannelId } from '@/models/room/valueObject/textChannelId';

interface IRoomRepository {
  findById(id: VoiceChannelId): Promise<Room | null>;
  save(voiceChannel: Room): Promise<void>;
}

class RoomRepository implements IRoomRepository {
  async findById(id: VoiceChannelId): Promise<Room | null> {
    const voiceChannelModel = await prisma.room.findUnique({
      where: {
        voiceChannelId: id.value,
      },
    });

    if (!voiceChannelModel)
      return null;

    return new Room(
      id,
      new VoiceChannelName(voiceChannelModel.voiceChannelName),
      voiceChannelModel.textChannelId ? new TextChannelId(voiceChannelModel.textChannelId) : null,
      new GuildId(voiceChannelModel.guildId),
    );
  }

  async save(voiceChannel: Room): Promise<void> {
    await prisma.room.upsert({
      where: {
        voiceChannelId: voiceChannel.id.value,
      },
      update: {
        voiceChannelName: voiceChannel.name.value,
        textChannelId: voiceChannel.textChannelId ? voiceChannel.textChannelId.value : null,
      },
      create: {
        voiceChannelId: voiceChannel.id.value,
        voiceChannelName: voiceChannel.name.value,
        textChannelId: voiceChannel.textChannelId ? voiceChannel.textChannelId.value : null,
        guildId: voiceChannel.guildId.value,
      },
    });
  }
}

export {
  IRoomRepository,
  RoomRepository,
}
