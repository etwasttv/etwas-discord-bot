import { BotCommand } from '@/types/command';
import { SlashCommandBuilder, TextChannel } from 'discord.js';

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('elect')
    .setDescription('Elect a member from the channel.'),
  handler: async interaction => {
    if (interaction.user.bot) return;
    if (!interaction.channel) return;

    const channel = interaction.channel as TextChannel;
    const members = channel.members.filter(m => !m.user.bot);

    const num = Math.floor(Math.random() * members.size);
    const member = members.at(num);
    if (!member)
      return;

    await interaction.reply({
      content: `${member}`,
    });
  },
};

export default command;
