import { prisma } from '@/core/prisma';
import { injectable } from 'tsyringe';

interface ICustomResponseService {
  searchResponseAsync(
    keyword: string,
    guildId: string,
  ): Promise<string | undefined>;
  registerResponseAsync(
    keyword: string,
    response: string,
    guildId: string,
  ): Promise<boolean>;
  unregisterResponseAsync(keyword: string, guildId: string): Promise<boolean>;
  upsertResponseAsync(
    keyword: string,
    response: string,
    guildId: string,
  ): Promise<void>;
}

@injectable()
class CustomResponseService implements ICustomResponseService {
  async searchResponseAsync(
    keyword: string,
    guildId: string,
  ): Promise<string | undefined> {
    const response = await prisma.response.findUnique({
      where: {
        guildId_keyword: {
          guildId: guildId,
          keyword: keyword,
        },
      },
    });
    return response?.response;
  }

  async registerResponseAsync(
    keyword: string,
    response: string,
    guildId: string,
  ): Promise<boolean> {
    return await prisma.$transaction(async (prisma) => {
      const existing = await prisma.response.findUnique({
        where: {
          guildId_keyword: {
            keyword: keyword,
            guildId: guildId,
          },
        },
      });
      if (existing) return false;
      await prisma.response.create({
        data: {
          guildId: guildId,
          keyword: keyword,
          response: response,
        },
      });
      return true;
    });
  }

  async unregisterResponseAsync(
    keyword: string,
    guildId: string,
  ): Promise<boolean> {
    try {
      await prisma.response.delete({
        where: {
          guildId_keyword: {
            keyword: keyword,
            guildId: guildId,
          },
        },
      });
    } catch (e) {
      return false;
    }
    return true;
  }

  async upsertResponseAsync(
    keyword: string,
    response: string,
    guildId: string,
  ): Promise<void> {
    await prisma.response.upsert({
      where: {
        guildId_keyword: {
          keyword: keyword,
          guildId: guildId,
        },
      },
      update: {
        response: response,
      },
      create: {
        guildId: guildId,
        keyword: keyword,
        response: response,
      },
    });
  }
}

export { type ICustomResponseService, CustomResponseService };
