import { BotCommand } from '@/types/command';
import { SlashCommandBuilder } from 'discord.js';

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

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('omikuji')
    .setDescription('Return random omikuji.'),
  handler: async interaction => {
    if (interaction.user.bot)
      return;

    const num = Math.floor(Math.random() * omikujiSum);
    const omikuji = omikujiIndex.find(o => o.from <= num && num < o.to);
    if (!omikuji)
      return;

    await interaction.reply({
      content: `あなたの今の運勢は **${omikuji.name}** です！`,
    });
  }
}

export default command;
