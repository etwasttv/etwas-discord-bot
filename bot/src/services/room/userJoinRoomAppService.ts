import { asyncLock } from '@/core/async-lock';
import { GuildId } from '@/models/guild/valueObject/guildId';
import { MemberId } from '@/models/member/valueObject/memberId';
import { Room } from '@/models/room/entity/room';
import { IRoomRepository, RoomRepository } from '@/models/room/repository/roomRepository';
import { VoiceChannelId } from '@/models/room/valueObject/voiceChannelId';
import { VoiceChannelName } from '@/models/room/valueObject/voiceChannelName';
import { GuildMember, VoiceChannel } from 'discord.js';

class UserJoinRoomAppService {
  private _roomRepository: IRoomRepository = new RoomRepository();

  async execute(channel: VoiceChannel, member: GuildMember) {
    const voiceChannelId = new VoiceChannelId(channel.id);
    await asyncLock.acquire(voiceChannelId.value, async () => {
      let room = await this._roomRepository.findById(voiceChannelId);
      if (!room)
        room = new Room(voiceChannelId, new VoiceChannelName(channel.name), null, new GuildId(channel.guildId));

      await room.inviteMember(new MemberId(member.id));
      await this._roomRepository.save(room);
    });
  }
}

export { UserJoinRoomAppService };
