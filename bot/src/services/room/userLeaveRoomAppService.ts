import { asyncLock } from '@/core/async-lock';
import { MemberId } from '@/models/member/valueObject/memberId';
import { IRoomRepository, RoomRepository } from '@/models/room/repository/roomRepository';
import { VoiceChannelId } from '@/models/room/valueObject/voiceChannelId';
import { GuildMember, VoiceChannel } from 'discord.js';

class UserLeaveRoomAppService {
  private _roomRepository: IRoomRepository = new RoomRepository();

  async execute(channel: VoiceChannel, member: GuildMember) {
    const voiceChannelId = new VoiceChannelId(channel.id);
    await asyncLock.acquire(voiceChannelId.value, async () => {
      let room = await this._roomRepository.findById(voiceChannelId);
      if (!room)
        return;
      await room.kickMember(new MemberId(member.id));
      await this._roomRepository.save(room);
    });
  }
}

export { UserLeaveRoomAppService };
