import { ITwitchNotificationChannelService } from '@/services/Twitch/TwitchNotificationChannelService';
import { BotCommand } from '@/types/command';
import { CommandInteractionOptionResolver, SlashCommandBuilder } from 'discord.js';
import { container } from 'tsyringe';

/**
 * /twitch
 * - notify hogehoge
 * - user hogehoge fugafuga
 * - protect channel
 */

const twitchNotificationChannelService = container.resolve<ITwitchNotificationChannelService>('ITwitchNotificationChannelService');

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('twitch')
    .setDescription('twitchコマンド')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('配信開始通知の設定を追加します')
        .addStringOption(option =>
          option.setName('login')
            .setDescription('配信通知するチャンネル')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('delete')
        .setDescription('配信開始通知の設定を削除します')
        .addStringOption(option =>
          option.setName('login')
            .setDescription('解除するチャンネル')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('配信開始通知を設定しているチャンネルを表示します')),
  handler: async interaction => {
    if (!interaction.channelId || !interaction.guildId) return;

    const options = interaction.options as CommandInteractionOptionResolver;
    const subCommand = options.getSubcommand();

    if (subCommand === 'subscribe') {
      const login = options.getString('login');
      if (!login) {
        await interaction.reply({
          content: 'Twitchチャンネルが見つかりませんでした',
          ephemeral: true,
        });
        return;
      }
      const result = await twitchNotificationChannelService.subscribe(login, interaction.guildId, interaction.channelId);
      if (result.status === 'faild') await interaction.reply({
        content: 'Twitchチャンネルの配信開始通知を設定できませんでした',
        ephemeral: true,
      });
      else await interaction.reply({
        content: `配信開始通知を設定しました\nlogin: ${login}`,
      });
    }
    else if (subCommand === 'unsubscribe') {
      const login = options.getString('login');
      if (!login) {
        await interaction.reply({
          content: 'Twitchチャンネルが見つかりませんでした',
          ephemeral: true,
        });
        return;
      }
      const result = await twitchNotificationChannelService.unsubscribe(login, interaction.guildId, interaction.channelId);
      if (result.status === 'faild') await interaction.reply({
        content: 'Twitchチャンネルの配信開始通知の設定を解除できませんでした\nlogin名が間違っているか、すでに設定が解除されている可能性があります',
        ephemeral: true,
      });
      else await interaction.reply({
        content: `配信開始通知の設定を削除しました。login: ${login}`,
      });
    }
    else if (subCommand === 'subscriptions') {
      const infos = await twitchNotificationChannelService.getSubscriptionList(interaction.guildId, interaction.channelId);
      if (infos.length === 0) {
        await interaction.reply(`${interaction.channel} では配信開始通知が設定していません。`)
      }
      const msg = infos.map(i => i.login).join('\n');
      await interaction.reply({
        content: `${interaction.channel} では以下のチャンネルの配信開始通知が設定されています。\n${msg}`,
      });
    }
  }
}

export default command;
