import { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } from 'discord.js';

import { prisma } from '../lib/prisma';
import { VcTurnOffButton } from '../components/vcTurnOffButton';
import { VcTurnOnButton } from '../components/vcTurnOnButton';
import { BotCommand } from '@/types/command';

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('vc')
    .setDescription('turn on/off voicevox'),
  handler: async (interaction) => {
    //  Return when executor is bot
    if (interaction.user.bot) return;

    //  Return invoked from non-server.
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

    // const button = room.useZundamon ? VcTurnOffButton : VcTurnOnButton;

    await interaction.reply({
      content: '🗣️読み上げ設定',
      // components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button)]
    });
  }
}

export default command;
