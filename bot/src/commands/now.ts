import { BotCommand } from '@/types/command';
import { SlashCommandBuilder } from 'discord.js';

const DayOfWeek = ['日', '月', '火', '水', '木', '金', '土'];

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('now')
    .setDescription('現在時刻を返します(JST)'),
  handler: async (interaction) => {
    if (interaction.user.bot) return;

    const current = new Date();
    current.setUTCHours(current.getUTCHours() + 9);
    await interaction.reply(
      `\`${current.getUTCFullYear()}年${current.getUTCMonth() + 1}月${current.getUTCDate()}日 ${DayOfWeek[current.getUTCDay()]}曜日 ${current.getUTCHours()}時${current.getUTCMinutes()}分\``,
    );
  },
};

export default command;
