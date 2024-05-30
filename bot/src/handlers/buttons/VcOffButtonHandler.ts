import { VcOffButton } from '@/components/buttons/VcOffButton';
import { VcOnButton } from '@/components/buttons/VcOnButton';
import { RoomService } from '@/services/Room';
import { VoiceService } from '@/services/Voice';
import { ButtonHandler } from '@/types/component';
import { ActionRowBuilder, ButtonBuilder, TextChannel } from 'discord.js';

const voiceService = new VoiceService();
const roomService = new RoomService();

const handler: ButtonHandler = {
  customId: VcOffButton.customId,
  handler: async (interaction) => {
    if (!interaction.channelId)
      return;

    const voiceChannel = await roomService.getVoiceChannel(interaction.channel as TextChannel);
    if (!voiceChannel)
      return;
    voiceService.disconnect(voiceChannel);

    await roomService.setVoice(voiceChannel, false);
    await interaction.update({
      components: [
        new ActionRowBuilder<ButtonBuilder>()
          .addComponents([ await VcOnButton.generate() ])]});
  }
}

export default handler;
