import { ActionRowBuilder, SlashCommandBuilder, StringSelectMenuBuilder } from 'discord.js';
import { prisma } from '../lib/prisma';
import { getSpeakerSelect } from '../components/speakerSelect';
import { BotCommand } from '@/types/command';

const command: BotCommand = {
  builder: new SlashCommandBuilder()
      .setName('voice')
      .setDescription('読み上げ音声の設定ができます'),
  handler: async (interaction) => {
    if (interaction.user.bot) return;

    const member = await prisma.member.upsert({
      where: {
        id: interaction.user.id,
      },
      create: {
        id: interaction.user.id,
      },
      update: {}
    });
    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(getSpeakerSelect(member.speakerId.toString()));

    await interaction.reply({
      content: '読み上げ音声設定',
      components: [row],
      ephemeral: true,
    });
  }
}

export default command;
