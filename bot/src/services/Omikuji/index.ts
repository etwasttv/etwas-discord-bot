import { prisma } from '@/core/prisma';
import { User } from 'discord.js';
import { injectable } from 'tsyringe';


const OMIKUJI: { name: string, ratio: number }[] = [
  { name: 'えと吉', ratio: 1 },
  { name: '超大吉', ratio: 9 },
  { name: '大吉', ratio: 30 },
  { name: '吉', ratio: 80 },
  { name: '中吉', ratio: 80 },
  { name: '小吉', ratio: 80 },
  { name: '末吉', ratio: 80 },
  { name: '凶', ratio: 30 },
  { name: '大凶', ratio: 9 },
  { name: '戦々凶々', ratio: 1 },
];

const omikujiIndex: { name: string, from: number, to: number }[] = [];
let omikujiSum = 0;
if (omikujiIndex.length === 0) {
  for (const { name, ratio } of OMIKUJI) {
    omikujiIndex.push({name, from: omikujiSum, to: omikujiSum + ratio});
    omikujiSum += ratio;
  }
}


interface IOmikujiService {
  omikuji(user: User): Promise<string>;
}


@injectable()
class OmikujiService implements IOmikujiService {

  async omikuji(user: User) {
    const today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);

    const dailyOmikuji = await prisma.omikuji.findUnique({
      where: {
        userId: user.id,
        updatedAt: {
          gte: today,
        }
      }
    });

    if (dailyOmikuji)
      return dailyOmikuji.omikuji;

    const num = Math.floor(Math.random() * omikujiSum);
    const omikuji = omikujiIndex.find(o => o.from <= num && num < o.to);
    if (!omikuji)
      return '';

    await prisma.omikuji.upsert({
      where: {
        userId: user.id,
      },
      create: {
        userId: user.id,
        omikuji: omikuji.name,
      },
      update: {
        omikuji: omikuji.name,
      }
    });

    return omikuji.name;
  }
}

export { type IOmikujiService, OmikujiService }
