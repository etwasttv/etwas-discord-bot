import { SlashCommandBuilder } from 'discord.js';
import { container } from 'tsyringe';

import { BotCommand } from '@/types/command';
import { IEmojiService } from '@/services/Emoji';

const emojiService = container.resolve<IEmojiService>('IEmojiService');

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('emoji')
    .setDescription('Return random emoji.'),
  handler: async (interaction) => {
    if (interaction.user.bot) return;

    const emoji = await emojiService.emojiGacha();

    await interaction.reply({
      content: emoji,
    });
  },
};

export default command;
