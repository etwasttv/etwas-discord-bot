import { VoiceSelectMenu } from '@/components/stringSelectMenus/VoiceSelectMenu';
import { VoiceService } from '@/services/Voice';
import { StringSelectMenuHandler } from '@/types/component';
import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

const voiceService = new VoiceService();

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
