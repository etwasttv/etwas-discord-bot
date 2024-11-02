import { BotCommand } from '@/types/command';
import { SlashCommandBuilder } from 'discord.js';

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('dog')
    .setDescription('Return random dog images.'),
  handler: async (interaction) => {
    if (interaction.user.bot) return;
    await interaction.deferReply();

    try {
      const response = await fetch('https://dog.ceo/api/breeds/image/random');
      if (!response.ok) {
        await interaction.editReply({
          content: 'U^ｪ^U',
        });
        return;
      }

      const json = await response.json();

      await interaction.editReply({
        content: 'wan!',
        files: [json['message']],
      });
    } catch (e) {
      console.error(e);
      await interaction.editReply({
        content: 'U^ｪ^U',
      });
    }
  },
};

export default command;
