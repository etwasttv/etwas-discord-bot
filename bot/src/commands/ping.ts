import { BotCommand } from '@/types/command';
import { SlashCommandBuilder } from 'discord.js';

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Bot will response with pong!'),
  handler: async interaction => {
    if (interaction.user.bot) return;

    await interaction.reply({
      content: "pong!",
    });
  },
};

export default command;
