import { prisma } from '@/lib/prisma';
import { Room } from '@/models/room/entity/room';
import { RoomId } from '@/models/room/valueObject/roomId';
import { TextChannelId } from '@/models/textChannel/valueObject/textChannelId';
import { VoiceChannelId } from '@/models/voiceChannel/valueObject/voiceChannelId';

interface IRoomRepository {
  findByVoiceChannelId(voiceChannelId: VoiceChannelId): Promise<Room | null>;
  findByTextChannelId(textChannelId: TextChannelId): Promise<Room | null>;
  save(room: Room): Promise<void>;
}

class RoomRepository implements IRoomRepository {
  async findByVoiceChannelId(voiceChannelId: VoiceChannelId): Promise<Room | null> {
    const roomModel = await prisma.room.findUnique({
      where: {
        voiceChannelId: voiceChannelId.value,
      },
    });

    if (!roomModel)
      return null;

    return new Room(new RoomId(voiceChannelId, new TextChannelId(roomModel.textChannelId)));
  }

  async findByTextChannelId(textChannelId: TextChannelId): Promise<Room | null> {
    const roomModel = await prisma.room.findUnique({
      where: {
        voiceChannelId: textChannelId.value,
      },
    });

    if (!roomModel)
      return null;

    return new Room(new RoomId(new VoiceChannelId(roomModel.voiceChannelId), textChannelId));
  }

  async save(room: Room) {
    await prisma.room.upsert({
      where: {
        voiceChannelId_textChannelId: {
          voiceChannelId: room.id.voiceChannelId.value,
          textChannelId: room.id.textChannelId.value,
        },
      },
      update: {
        voiceChannelId: room.id.voiceChannelId.value,
        textChannelId: room.id.textChannelId.value,
      },
      create: {
        voiceChannelId: room.id.voiceChannelId.value,
        textChannelId: room.id.textChannelId.value,
      },
    });
  }
}
