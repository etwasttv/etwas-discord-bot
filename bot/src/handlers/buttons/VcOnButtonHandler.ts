import { VcOffButton } from '@/components/buttons/VcOffButton';
import { VcOnButton } from '@/components/buttons/VcOnButton';
import { RoomService } from '@/services/Room';
import { VoiceService } from '@/services/Voice';
import { ButtonHandler } from '@/types/component';
import { ActionRowBuilder, ButtonBuilder, TextChannel } from 'discord.js';

const voiceService = new VoiceService();
const roomService = new RoomService();

const handler: ButtonHandler = {
  customId: VcOnButton.customId,
  handler: async (interaction) => {
    if (!interaction.channelId)
      return;

    const voiceChannel = await roomService.getVoiceChannel(interaction.channel as TextChannel);
    if (!voiceChannel)
      return;
    const result = voiceService.connect(voiceChannel);

    if (result) {
      await roomService.setVoice(voiceChannel, true);
      await interaction.update({
        components: [
          new ActionRowBuilder<ButtonBuilder>()
            .addComponents([ await VcOffButton.generate() ])]});
    }
    else
      await interaction.reply({
        content: 'Cant connect to VoiceChannel.'});
  }
}

export default handler;
