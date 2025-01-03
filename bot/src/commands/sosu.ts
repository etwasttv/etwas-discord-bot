import { BotCommand } from '@/types/command';
import { CommandInteractionOptionResolver, SlashCommandBuilder } from 'discord.js';

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

    if (!number) {
      await interaction.reply({
        content: '数を指定してね',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    const isSosu = judge(number);
    if (isSosu) {
      await interaction.editReply({
        content: `${number} は素数です！`,
      });
    }
    else {
      await interaction.editReply({
        content: `${number} は素数ではありません！`,
      });
    }
  },
};

export default command;
