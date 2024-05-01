import { prisma } from '@/lib/prisma';
import { GuildId } from '@/models/guild/valueObject/guildId';
import { TextChannel } from '@/models/textChannel/entity/textChannel';
import { TextChannelId } from '@/models/textChannel/valueObject/textChannelId';
import { TextChannelName } from '@/models/textChannel/valueObject/textChannelName';

interface ITextChannelNotification {
  set textChannelId(id: TextChannelId);
  set textChannelName(name: TextChannelName);
  set guildId(guildId: GuildId);
}

class TextChannelNotification implements ITextChannelNotification {
  private _textChannelId: TextChannelId = new TextChannelId('');
  private _textChannelName: TextChannelName = new TextChannelName('');
  private _guildId: GuildId = new GuildId('');

  set textChannelId(id: TextChannelId) { this._textChannelId = new TextChannelId(id.value); }
  set textChannelName(name: TextChannelName) { this._textChannelName = new TextChannelName(name.value); }
  set guildId(guildId: GuildId) { this._guildId = new GuildId(guildId.value); }

  get textChannelId(): TextChannelId { return this._textChannelId; }
  get textChannelName(): TextChannelName { return this._textChannelName; }
  get guildId(): GuildId { return this._guildId; }
}

interface ITextChannelRepository {
  findById(id: TextChannelId): Promise<TextChannel|null>;
  save(textChannel: TextChannel): Promise<void>;
  remove(id: TextChannelId): Promise<void>;
}

class TextChannelRepository implements ITextChannelRepository {
  async findById(id: TextChannelId): Promise<TextChannel | null> {
    const textChannelModel = await prisma.textChannel.findUnique({
      where: {
        textChannelId: id.value,
      }
    });

    if (!textChannelModel)
      return null;

    return new TextChannel(
      id,
      new TextChannelName(textChannelModel.textChannelName),
      new GuildId(textChannelModel.guildId),
    );
  }

  async save(textChannel: TextChannel): Promise<void> {
    const note = new TextChannelNotification();
    textChannel.notify(note);

    await prisma.textChannel.upsert({
      where: {
        textChannelId: note.textChannelId.value,
      },
      update: {
        textChannelName: note.textChannelName.value,
      },
      create: {
        textChannelId: note.textChannelId.value,
        textChannelName: note.textChannelName.value,
        guildId: note.guildId.value,
      },
    });
  }

  async remove(id: TextChannelId): Promise<void> {
    await prisma.textChannel.delete({
      where: {
        textChannelId: id.value,
      }
    });
  }
}

export {
  ITextChannelNotification,
  ITextChannelRepository,
  TextChannelRepository,
};
