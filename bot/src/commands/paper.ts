import { IPaperService } from '@/services/Paper';
import { BotCommand } from '@/types/command';
import { SlashCommandBuilder } from 'discord.js';
import { container } from 'tsyringe';

const service = container.resolve<IPaperService>('IPaperService');

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('paper')
    .setDescription('Check paper update'),
  handler: async (interaction) => {
    if (interaction.user.bot) return;

    await interaction.deferReply();

    const version = await service.getLatestBuild();
    console.log(version);

    await interaction.editReply({
      content: `Paperの最新の成功ビルドはMinecraft${version?.mcVersion}Build${version?.buildNumber}です`,
    });
  },
};

export default command;
