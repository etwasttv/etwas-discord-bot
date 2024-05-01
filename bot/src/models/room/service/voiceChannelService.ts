import { discordClient } from '@/core/discord-client';
import { Room } from '@/models/room/entity/room';

class VoiceChannelService {
  async exists(voiceChannel: Room): Promise<boolean> {
    return !!await discordClient.channels.fetch(voiceChannel.id.value);
  }
}

export { VoiceChannelService };
