import { BotCommand } from '@/types/command';
import { SlashCommandBuilder } from 'discord.js';

/**
 * /twitch
 * - notify hogehoge
 * - user hogehoge fugafuga
 * - protect channel
 */

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('twitch')
    .setDescription('twitchコマンド')
    .addSubcommand(sub =>
      sub.setName('subscribe')
        .setDescription('チャンネルの配信開始通知を取得します')
        .addStringOption(option =>
          option.setName('チャンネル')
            .setDescription('配信通知するチャンネル')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('unsubscribe')
        .setDescription('配信開始通知の取得を解除します')
        .addStringOption(option =>
          option.setName('チャンネル')
            .setDescription('解除するチャンネル')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('subscriptions')
        .setDescription('配信開始通知を購読しているチャンネルを表示します')),
  handler: async interaction => {
    if (!interaction.channelId) return;
    
  }
}
