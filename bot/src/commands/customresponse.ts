import { ICustomResponseService } from '@/services/CustomResponse';
import { BotCommand } from '@/types/command';
import {
  CommandInteractionOptionResolver,
  SlashCommandBuilder,
} from 'discord.js';
import { container } from 'tsyringe';

const service = container.resolve<ICustomResponseService>(
  'ICustomResponseService',
);

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('customresponse')
    .setDescription('カスタムレスポンスを設定します')
    .addSubcommand((cmd) =>
      cmd
        .setName('add')
        .setDescription('新たなカスタムレスポンスを設定します')
        .addStringOption((opt) =>
          opt
            .setName('keyword')
            .setDescription('キーワード')
            .setRequired(true)
            .setMinLength(1),
        )
        .addStringOption((opt) =>
          opt
            .setName('response')
            .setDescription('レスポンス')
            .setRequired(true)
            .setMinLength(1),
        )
        .addBooleanOption((opt) =>
          opt
            .setName('update')
            .setDescription('既存の設定を上書きします')
            .setRequired(false),
        ),
    )
    .addSubcommand((cmd) =>
      cmd
        .setName('delete')
        .setDescription('カスタムレスポンスを削除します')
        .addStringOption((opt) =>
          opt.setName('keyword').setDescription('キーワード').setRequired(true),
        ),
    ),
  handler: async (interaction) => {
    if (interaction.user.bot) return;
    if (!interaction.guildId) {
      await interaction.reply('このコマンドはサーバー専用コマンドだよ');
      return;
    }
    const options = interaction.options as CommandInteractionOptionResolver;
    const subcommand = options.getSubcommand(true);
    if (subcommand === 'add') {
      const keyword = options.getString('keyword', true);
      const response = options.getString('response', true);
      const update = options.getBoolean('update', false) ?? false;
      if (update) {
        await service.upsertResponseAsync(
          keyword,
          response,
          interaction.guildId,
        );
        await interaction.reply('カスタムレスポンスを設定しました');
        return;
      } else {
        const result = await service.registerResponseAsync(
          keyword,
          response,
          interaction.guildId,
        );
        if (result) {
          await interaction.reply('カスタムレスポンスを設定しました');
        } else {
          await interaction.reply(
            'キーワードがすでに使用されています\n設定を上書きする場合には`update`を`true`にして実行してください',
          );
        }
      }
    } else if (subcommand === 'delete') {
      const keyword = options.getString('keyword', true);
      const result = await service.unregisterResponseAsync(
        keyword,
        interaction.guildId,
      );
      if (result) {
        await interaction.reply('カスタムレスポンスを削除しました');
      } else {
        await interaction.reply(
          '指定したキーワードに対するカスタムレスポンスは見つかりませんでした',
        );
      }
    }
  },
};

export default command;
