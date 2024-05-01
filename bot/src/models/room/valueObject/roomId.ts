import { TextChannelId } from '@/models/textChannel/valueObject/textChannelId';
import { VoiceChannelId } from '@/models/voiceChannel/valueObject/voiceChannelId';

class RoomId extends Id {
  constructor(public readonly voiceChannelId: VoiceChannelId, public readonly textChannelId: TextChannelId) {
    super();
  }
  compareTo(A: any): boolean {
    if (!(A instanceof RoomId))
      return false;
    return this.textChannelId.compareTo(A.textChannelId) && this.voiceChannelId.compareTo(A.voiceChannelId);
  }
}

export { RoomId };
