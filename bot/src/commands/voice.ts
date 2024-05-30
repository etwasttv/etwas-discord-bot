import { VoiceSelectMenu } from '@/components/stringSelectMenus/VoiceSelectMenu';
import { VoiceService } from '@/services/Voice';
import { BotCommand } from '@/types/command';
import { ActionRowBuilder, SlashCommandBuilder, StringSelectMenuBuilder } from 'discord.js';

const voiceService = new VoiceService();

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('voice')
    .setDescription('読み上げ音声の設定ができます'),
  handler: async (interaction) => {
    if (interaction.user.bot) return;
    if (!interaction.guild) return;

    const speakerId = await voiceService.getSpeakerId(interaction.guild, interaction.user);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents([await VoiceSelectMenu.generate(speakerId)]);

    await interaction.reply({
      content: '読み上げ音声設定',
      components: [row],
      ephemeral: true,
    });
  }
}

export default command;
