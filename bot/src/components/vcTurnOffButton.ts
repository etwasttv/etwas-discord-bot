import { ActionRowBuilder, ButtonBuilder, ButtonStyle, VoiceChannel } from "discord.js";
import { ButtonHandler } from "../lib";
import { VcTurnOnButton } from "./vcTurnOnButton";
import { prisma } from "../lib/prisma";
import { turnOffVc } from "../services/reading";

export const VcTurnOffButton = new ButtonBuilder()
    .setCustomId('vc-turn-off')
    .setLabel('読み上げOFFにする')
    .setStyle(ButtonStyle.Danger);

export const handler = new ButtonHandler(
  'vc-turn-off',
  async (interaction) => {
    console.log(interaction);
    const room = await prisma.room.findUnique({
      where: {
        textChannelId: interaction.channelId,
      }
    });
    if (!room || !room.voiceChannelId || !interaction.guild) return;
    await interaction.update({
      components: [new ActionRowBuilder<ButtonBuilder>().addComponents(VcTurnOnButton)],
    });

    const voiceChannel = <VoiceChannel>(await interaction.guild.channels.fetch(room.voiceChannelId));
    await turnOffVc(voiceChannel);
  }
);
