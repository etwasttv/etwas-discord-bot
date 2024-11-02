import { BotCommand } from '@/types/command';
import { SlashCommandBuilder } from 'discord.js';

const HANDS = [':fist:', ':v:', ':hand_splayed:'];

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('janken')
    .setDescription('じゃんけん'),
  handler: async (interaction) => {
    if (interaction.user.bot) return;

    const rnd = Math.floor(Math.random() * 3);
    await interaction.reply({
      content: HANDS[rnd],
    });
  },
};

export default command;
