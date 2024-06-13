import { prisma } from '@/core/prisma';
import { Omikuji } from '../entities';
import { injectable } from 'tsyringe';

interface IOmikujiRepository {
  create(omikuji: Omikuji): Promise<void>;
  update(omikuji: Omikuji): Promise<void>;
  find(userId: string): Promise<Omikuji|null>;
}

@injectable()
class OmikujiRepository implements IOmikujiRepository {
  async create(omikuji: Omikuji): Promise<void> {
    await prisma.omikuji.create({
      data: {
        userId: omikuji.userId,
        omikuji: omikuji.omikuji,
      }
    });
  }

  async update(omikuji: Omikuji): Promise<void> {
    await prisma.omikuji.update({
      where: {
        userId: omikuji.userId,
      },
      data: {
        omikuji: omikuji.omikuji,
      }
    });
  }

  async find(userId: string): Promise<Omikuji | null> {
    const _omikuji = await prisma.omikuji.findUnique({
      where: {
        userId: userId,
      }
    });

    if (!_omikuji)
      return null;

    return new Omikuji(_omikuji.userId, _omikuji.omikuji, _omikuji.updatedAt);
  }
}

export { type IOmikujiRepository, OmikujiRepository }
