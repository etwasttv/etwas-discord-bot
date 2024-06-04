import { BotCommand } from '@/types/command';
import { SlashCommandBuilder } from 'discord.js';

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('chinchiro')
    .setDescription('ちんちろ用'),
  handler: async interaction => {
    if (interaction.user.bot) return;

    let ans: number[] = [];
    for (let i=0; i<3; i++)
      ans.push(Math.floor(Math.random() * 6 + 1));

    let rep = '';
    rep += ans.map(a => '`'+a.toString()+'`').join(' ') + '\n';

    await interaction.reply({
      content: rep,
    });
  },
};

export default command;
