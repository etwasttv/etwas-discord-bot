import { BotCommand } from '@/types/command';
import { CommandInteractionOptionResolver, SlashCommandBuilder } from 'discord.js';

type SosuJudge = {
  isSosu: boolean;
  dividedBy?: number;
  error?: string;
}

function judge(number: number): SosuJudge {
  if (number <= 1) return { isSosu: false, error: '入力値が不正' };
  if (number === 2) return { isSosu: true };
  if (number%2 === 0) return { isSosu: false, dividedBy: 2 };
  let d = 3;
  while (d <= Math.sqrt(number)) {
    if (number%d === 0) return { isSosu: false, dividedBy: d };
    d += 2;
  }
  return { isSosu: true };
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

    const isSosu = judge(number);
    if (isSosu.isSosu) {
      await interaction.editReply({
        content: `${number} は素数です！`,
      });
    }
    else if (isSosu.dividedBy) {
      await interaction.editReply({
        content: `${number} は素数ではありません！ ${isSosu.dividedBy} で割ることができます`,
      });
    }
    await interaction.editReply({
      content: `${number} が素数かどうか判定中できませんでした`,
    });
  },
};

export default command;
