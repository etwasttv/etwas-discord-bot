import { SlashCommandBuilder } from 'discord.js';

import { AppCommandHandler } from '../lib';
import {
  hasConnection,
  leaveVC,
  joinVC,
} from '../services/reading';
import { getVoiceChannel } from '../lib/utils';
import { sendTextToRoom } from '../services/room';

export const handler = new AppCommandHandler(
  new SlashCommandBuilder()
    .setName('vc')
    .setDescription('turn on/off voicevox'),
  async (interaction) => {
    if (interaction.user.bot) return;
    if (!interaction.guild) {
      await interaction.reply({
        content: 'サーバーから実行してください',
        ephemeral: true,
      });
      return;
    }

    const voiceChannel = await getVoiceChannel(interaction.guild, interaction.user.id);
    if (!voiceChannel) {
      await interaction.reply({
        content: 'ボイスチャンネルから実行してください',
        ephemeral: true,
      });
      return;
    }

    if (hasConnection(voiceChannel)) {
      leaveVC(voiceChannel);
      await interaction.reply({
        content: '専用チャンネルの読み上げを終了します',
        ephemeral: true,
      });
      await sendTextToRoom(voiceChannel, 'このチャンネルの読み上げを終了します');
    } else {
      joinVC(voiceChannel);
      await interaction.reply({
        content: '専用チャンネルの読み上げを開始します',
        ephemeral: true,
      });
      await sendTextToRoom(voiceChannel, 'このチャンネルの読み上げを開始します');
    }
  },
);
