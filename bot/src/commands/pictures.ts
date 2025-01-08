import { IDriveService } from '@/services/Drive';
import { BotCommand } from '@/types/command';
import {
  AttachmentBuilder,
  CommandInteractionOptionResolver,
  SlashCommandBuilder,
} from 'discord.js';
import { container } from 'tsyringe';

const driveService = container.resolve<IDriveService>('IDriveService');

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('picture')
    .setDescription('ランダムな画像を返します')
    .addStringOption((opt) =>
      opt
        .setName('action')
        .setDescription('アクション')
        .setRequired(false)
        .addChoices(
          { name: 'ランダムな画像を表示(デフォルト)', value: 'image' },
          { name: 'Google DriveのURLを表示', value: 'drive' },
        ),
    ),
  handler: async (interaction) => {
    if (interaction.user.bot) return;

    const options = interaction.options as CommandInteractionOptionResolver;
    const action = options.getString('action') ?? 'image';

    await interaction.deferReply();

    if (action === 'image') {
      const result = await driveService.pictureGacha();
      if (!result) {
        await interaction.editReply('スクリーンショットのストックが無かったよ');
        return;
      }

      await interaction.editReply({
        files: [new AttachmentBuilder(result.buffer, { name: result.name })],
      });
    } else {
      await interaction.editReply({
        content: `画像の追加は**[こちら](https://drive.google.com/drive/folders/${process.env.PICTURE_FOLDER_ID})**!`,
      });
    }
  },
};

export default command;
