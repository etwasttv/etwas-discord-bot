import { Omikuji } from '@/entities';
import { type IOmikujiRepository } from '@/repositories/omikujiRepository';
import { User } from 'discord.js';
import { inject, injectable } from 'tsyringe';


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

  constructor(@inject('IOmikujiRepository') private _repository: IOmikujiRepository) { }

  async omikuji(user: User) {
    const today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);

    const dailyOmikuji = await this._repository.find(user.id);
    if (dailyOmikuji && dailyOmikuji.updatedAt.getTime() - today.getTime() >= 0)
      return dailyOmikuji.omikuji;

    const num = Math.floor(Math.random() * omikujiSum);
    const omikujiValue = omikujiIndex.find(o => o.from <= num && num < o.to);
    if (!omikujiValue)
      return '';

    const omikuji = new Omikuji(user.id, omikujiValue.name, new Date());
    if (dailyOmikuji)
      await this._repository.update(omikuji);
    else
      await this._repository.create(omikuji);

    return omikuji.omikuji;
  }
}

export { type IOmikujiService, OmikujiService }
