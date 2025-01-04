import { BotCommand } from '@/types/command';
import { CommandInteractionOptionResolver, SlashCommandBuilder } from 'discord.js';

const ue = '⁰¹²³⁴⁵⁶⁷⁸⁹';

function judge(number: number): boolean {
  if (number <= 1) return false;
  if (number === 2) return true;
  if (number%2 === 0) return false;
  let d = 3;
  while (d <= Math.sqrt(number)) {
    if (number%d === 0) return false;
    d += 2;
  }
  return true;
}

function factorize(number: number): Array<number> {
  if (number < 1) return [];
  let x = number;
  const result: Array<number> = [];
  if (number == 1 || judge(number)) {
    result.push(number);
    return result;
  }
  while (x%2 === 0) {
    x /= 2;
    result.push(2);
  }
  let d = 3;
  while (d <= x) {
    while (x%d === 0) {
      x /= d;
      result.push(d);
    }
    d += 2;
  }
  return result;
}

function generateUe(value: number): string {
  let result = '';
  let x = value;

  while (x > 0) {
    const i = x%10;
    result = ue.charAt(i) + result;
    x /= 10;
    x = Math.floor(x);
  }

  return result;
}

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('sosu')
    .setDescription('素数か判定する')
    .addIntegerOption(opt =>
      opt.setName('number')
        .setDescription('判定したい数')
        .setRequired(true)
        .setMinValue(2)),
  handler: async (interaction) => {
    if (interaction.user.bot) return;
    const options = interaction.options as CommandInteractionOptionResolver;
    const number = options.getInteger('number');

    if (!number || number < 2) {
      await interaction.reply({
        content: '2以上の数を指定してね',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    if (judge(number)) {
      await interaction.editReply({
        content: `${number} は素数です！`,
      });
      return;
    }
    else {
      const factor = factorize(number);
      const summary = new Map<number, number>();
      for (const f of factor) {
        const count = summary.get(f) ?? 0;
        summary.set(f, count+1);
      }
      let formulas: string[] = [];
      for (const count of summary) {
        formulas.push(`${count[0]}${generateUe(count[1])}`);
      }
      let msg = `${number} は素数じゃありません！\n`;
      msg += `${formulas.join('x')} = ${number} なので合成数です！`;
      await interaction.editReply({
        content: msg,
      });
    }
  },
};

export default command;
