import { IDriveService } from '@/services/Drive';
import { BotCommand } from '@/types/command';
import { AttachmentBuilder, SlashCommandBuilder } from 'discord.js';
import { container } from 'tsyringe';

const driveService = container.resolve<IDriveService>('IDriveService');

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('picture')
    .setDescription('ランダムな画像を返します'),
  handler: async (interaction) => {
    if (interaction.user.bot) return;

    await interaction.deferReply();

    const result = await driveService.pictureGacha();
    if (!result) {
      await interaction.editReply('スクリーンショットのストックが無かったよ');
      return;
    }

    await interaction.editReply({
      files: [new AttachmentBuilder(result.buffer, { name: result.name })],
    });
  },
};

export default command;
