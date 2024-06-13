import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { container } from 'tsyringe';

import { VoiceSelectMenu } from '@/components/stringSelectMenus/VoiceSelectMenu';
import { type IVoiceService } from '@/services/Voice';
import { StringSelectMenuHandler } from '@/types/component';

const voiceService = container.resolve<IVoiceService>('IVoiceService');

const handler: StringSelectMenuHandler = {
  customId: VoiceSelectMenu.customId,
  handler: async (interaction) => {
    if (!interaction.channel)
      return;
    if (!interaction.guild)
      return;

    const spaekerId = Number(interaction.values[0]);

    console.log(`[Voice] ${interaction.user.globalName} selects new spaker. spakerId = ${spaekerId}`);

    await voiceService.setSpeaker(interaction.guild, interaction.user, spaekerId);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents([await VoiceSelectMenu.generate(spaekerId)]);
    await interaction.update({
      components: [row]});
  }
}

export default handler;
