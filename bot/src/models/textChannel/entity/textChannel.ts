import { TextChannelId } from '../valueObject/textChannelId';
import { TextChannelName } from '../valueObject/textChannelName';
import { GuildId } from '@/models/guild/valueObject/guildId';
import { discordClient } from '@/core/discord-client';
import { ITextChannelNotification } from '../repository/textChannelRepository';

class TextChannel extends Entity {
  get id(): TextChannelId {
    return this._id;
  }
  constructor(
    protected readonly _id: TextChannelId,
    private _name: TextChannelName,
    private _guildId: GuildId,
  ) {
    super(_id);
  }

  async exists(): Promise<boolean> {
    return !!await discordClient.channels.fetch(this.id.value);
  }

  notify(note: ITextChannelNotification) {
    note.textChannelId = this._id;
    note.textChannelName = this._name;
    note.guildId = this._guildId;
  }
}

export { TextChannel };
