import { OmikujiService } from '@/services/Omikuji';
import { BotCommand } from '@/types/command';
import { SlashCommandBuilder } from 'discord.js';

const omikujiService = new OmikujiService();

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('omikuji')
    .setDescription('Return random omikuji.'),
  handler: async interaction => {
    if (interaction.user.bot)
      return;

    const omikuji = await omikujiService.omikuji(interaction.user);

    await interaction.reply({
      content: `あなたの今の運勢は **${omikuji}** です！`,
    });
  }
}

export default command;
