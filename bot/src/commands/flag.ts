import { SlashCommandBuilder } from 'discord.js';
import { container } from 'tsyringe';

import { BotCommand } from '@/types/command';
import { IEmojiService } from '@/services/Emoji';

const emojiService = container.resolve<IEmojiService>('IEmojiService');

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('flag')
    .setDescription('Return random emoji flag.'),
  handler: async interaction => {
    if (interaction.user.bot)
      return;

    const emoji = await emojiService.flagGacha();

    await interaction.reply({
      content: emoji,
    });
  }
}

export default command;
