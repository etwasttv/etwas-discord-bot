import { SlashCommandBuilder } from 'discord.js';
import { container } from 'tsyringe';

import { type IOmikujiService } from '@/services/Omikuji';
import { BotCommand } from '@/types/command';

const omikujiService = container.resolve<IOmikujiService>('IOmikujiService');

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('omikuji')
    .setDescription('Return random omikuji.'),
  handler: async (interaction) => {
    if (interaction.user.bot) return;

    const omikuji = await omikujiService.omikuji(interaction.user);

    await interaction.reply({
      content: `あなたの今の運勢は **${omikuji}** です！`,
    });
  },
};

export default command;
