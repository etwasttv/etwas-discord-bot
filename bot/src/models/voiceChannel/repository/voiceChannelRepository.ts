import { prisma } from '@/lib/prisma';
import { VoiceChannel } from '@/models/voiceChannel/entity/voicechannel';
import { VoiceChannelId } from '@/models/voiceChannel/valueObject/voiceChannelId';
import { VoiceChannelName } from '@/models/voiceChannel/valueObject/voiceChannelName';
import { GuildId } from '@/models/guild/valueObject/guildId';

interface IVoiceChannelRepository {
  findById(id: VoiceChannelId): Promise<VoiceChannel | null>;
  save(voiceChannel: VoiceChannel): Promise<void>;
}

class VoiceChannelRepository implements IVoiceChannelRepository {
  async findById(id: VoiceChannelId): Promise<VoiceChannel | null> {
    const voiceChannelModel = await prisma.voiceChannel.findUnique({
      where: {
        voiceChannelId: id.value,
      }
    });

    if (!voiceChannelModel)
      return null;

    return new VoiceChannel(
      id,
      new VoiceChannelName(voiceChannelModel.voiceChannelName),
      new GuildId(voiceChannelModel.guildId),
    );
  }

  async save(voiceChannel: VoiceChannel): Promise<void> {
    const note = new VoiceChannelNotification();
    voiceChannel.notify(note);

    await prisma.voiceChannel.upsert({
      where: {
        voiceChannelId: note.voiceChannelId.value,
      },
      update: {
        voiceChannelName: note.voiceChannelName.value,
      },
      create: {
        voiceChannelId: note.voiceChannelId.value,
        voiceChannelName: note.voiceChannelName.value,
        guildId: note.guildId.value,
      },
    });
  }
}

interface IVoiceChannelNotification {
  set voiceChannelId(id: VoiceChannelId);
  set voiceChannelName(name: VoiceChannelName);
  set guildId(guildId: GuildId)
}

class VoiceChannelNotification implements IVoiceChannelNotification {
  private _voiceChannelId: VoiceChannelId = new VoiceChannelId('');
  private _voiceChannelName: VoiceChannelName = new VoiceChannelName('');
  private _guildId: GuildId = new GuildId('');

  set voiceChannelId(id: VoiceChannelId) { this._voiceChannelId = id; }
  set voiceChannelName(name: VoiceChannelName) { this._voiceChannelName = name; }
  set guildId(guildId: GuildId) { this._guildId = guildId; }

  get voiceChannelId(): VoiceChannelId { return this._voiceChannelId; }
  get voiceChannelName(): VoiceChannelName { return this._voiceChannelName; }
  get guildId(): GuildId { return this._guildId; }
}

export {
  IVoiceChannelNotification,
  IVoiceChannelRepository,
  VoiceChannelRepository,
}
