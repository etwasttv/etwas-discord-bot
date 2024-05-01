import { IVoiceChannelNotification } from '@/models/voiceChannel/repository/voiceChannelRepository';
import { VoiceChannelId } from '../valueObject/voiceChannelId';
import { VoiceChannelName } from '../valueObject/voiceChannelName';
import { discordClient } from '@/core/discord-client';
import { GuildId } from '@/models/guild/valueObject/guildId';

class VoiceChannel extends Entity {
  get id(): VoiceChannelId {
    return this._id;
  }
  constructor(
    protected readonly _id: VoiceChannelId,
    private _name: VoiceChannelName,
    private _guildId: GuildId,
  ) {
    super(_id);
  }

  async exists(): Promise<boolean> {
    return !!await discordClient.channels.fetch(this.id.value);
  }

  notify(note: IVoiceChannelNotification) {
    note.voiceChannelId = new VoiceChannelId(this._id.value);
    note.voiceChannelName = new VoiceChannelName(this._name.value)
    note.guildId = new GuildId(this._guildId.value);
  }
}

export { VoiceChannel };
