import { ActionRowBuilder, ButtonBuilder, ButtonStyle, VoiceChannel } from "discord.js";
import { ComponentHandler } from "../lib";
import { VcTurnOffButton } from './vcTurnOffButton';
import { turnOnVc } from "../services/reading";
import { prisma } from "../lib/prisma";

export const VcTurnOnButton = new ButtonBuilder()
    .setCustomId('vc-turn-on')
    .setLabel('読み上げONにする')
    .setStyle(ButtonStyle.Success);

export const handler = new ComponentHandler(
  'vc-turn-on',
  async (interaction) => {
    const room = await prisma.room.findUnique({
      where: {
        textChannelId: interaction.channelId,
      }
    });
    if (!room || !room.voiceChannelId || !interaction.guild) return;
    await interaction.update({
      components: [new ActionRowBuilder<ButtonBuilder>().addComponents([VcTurnOffButton])],
    });

    try {
      await turnOnVc(room.voiceChannelId, interaction.guild.id);
    } catch (err) {
      await interaction.channel?.send('botは今忙しいようです');
    }
  }
);
