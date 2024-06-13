import { prisma } from '@/core/prisma';
import { VoiceConfig } from '@/entities';
import { injectable } from 'tsyringe';

interface IVoiceConfigRepository {
  create(voiceConfig: VoiceConfig): Promise<void>;
  update(voiceConfig: VoiceConfig): Promise<void>;
  find(guildId: string, userId: string): Promise<VoiceConfig|null>;
}

@injectable()
class VoiceConfigRepository implements IVoiceConfigRepository {
  async create(voiceConfig: VoiceConfig): Promise<void> {
    await prisma.voice.create({
      data: {
        userId: voiceConfig.userId,
        guildId: voiceConfig.guildId,
        speakerId: voiceConfig.speakerId,
      }
    });
  }

  async update(voiceConfig: VoiceConfig): Promise<void> {
    await prisma.voice.update({
      where: {
        guildId_userId: {
          userId: voiceConfig.userId,
          guildId: voiceConfig.guildId,
        }
      },
      data: {
        speakerId: voiceConfig.speakerId,
      }
    });
  }

  async find(guildId: string, userId: string): Promise<VoiceConfig|null> {
    const _voiceConfig = await prisma.voice.findUnique({
      where: {
        guildId_userId: {
          userId: userId,
          guildId: guildId,
        }
      }
    });

    if (!_voiceConfig)
      return null;

    return new VoiceConfig(_voiceConfig.guildId, _voiceConfig.userId, _voiceConfig.speakerId);
  }
}

export { type IVoiceConfigRepository, VoiceConfigRepository }
