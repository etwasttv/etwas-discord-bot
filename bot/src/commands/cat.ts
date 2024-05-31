import { BotCommand } from '@/types/command';
import { SlashCommandBuilder } from 'discord.js';

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('cat')
    .setDescription('Return random cat images.'),
  handler: async interaction => {
    if (interaction.user.bot) return;
    await interaction.deferReply();

    try {
      const response = await fetch('https://api.thecatapi.com/v1/images/search');
      if (!response.ok) {
        await interaction.editReply({
          content: '(=^・^=)',
        });
        return;
      }

      const json = await response.json();

      await interaction.editReply({
        content: 'nya~',
        files: [json[0]['url']],
      });
    } catch (e) {
      console.error(e);
      await interaction.editReply({
        content: '(=^・^=)',
      });
    }
  },
};

export default command;
