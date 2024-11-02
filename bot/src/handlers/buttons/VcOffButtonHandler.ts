import { ActionRowBuilder, ButtonBuilder, TextChannel } from 'discord.js';
import { container } from 'tsyringe';

import { VcOffButton } from '@/components/buttons/VcOffButton';
import { VcOnButton } from '@/components/buttons/VcOnButton';
import { ButtonHandler } from '@/types/component';
import { type IRoomService } from '@/services/Room';
import { type IVoiceService } from '@/services/Voice';

const voiceService = container.resolve<IVoiceService>('IVoiceService');
const roomService = container.resolve<IRoomService>('IRoomService');

const handler: ButtonHandler = {
  customId: VcOffButton.customId,
  handler: async (interaction) => {
    if (!interaction.channelId) return;

    const voiceChannel = await roomService.getVoiceChannel(
      interaction.channel as TextChannel,
    );
    if (!voiceChannel) return;
    voiceService.disconnect(voiceChannel);

    await roomService.setVoice(voiceChannel, false);
    await interaction.update({
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents([
          await VcOnButton.generate(),
        ]),
      ],
    });
  },
};

export default handler;
