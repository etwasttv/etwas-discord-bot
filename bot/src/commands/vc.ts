import { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } from 'discord.js';

import { AppCommandHandler } from '../lib';
import { prisma } from '../lib/prisma';
import { VcTurnOffButton } from '../components/vcTurnOffButton';
import { VcTurnOnButton } from '../components/vcTurnOnButton';

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

    const room = await prisma.room.findUnique({
      where: {
        textChannelId: interaction.channelId,
      }
    });

    if (!room) {
      await interaction.reply({
        content: 'このチャンネルを読み上げることはできません\n通話用チャンネルで実行してください',
        ephemeral: true,
      });
      return;
    }

    const button = room.useZundamon ? VcTurnOffButton : VcTurnOnButton;

    await interaction.reply({
      content: '🗣️読み上げ設定',
      components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button)]
    });
  },
);
