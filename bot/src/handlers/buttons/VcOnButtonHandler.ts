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
  customId: VcOnButton.customId,
  handler: async (interaction) => {
    if (!interaction.channelId) return;

    const voiceChannel = await roomService.getVoiceChannel(
      interaction.channel as TextChannel,
    );
    if (!voiceChannel) return;
    const result = voiceService.connect(voiceChannel);

    if (result) {
      await roomService.setVoice(voiceChannel, true);
      await interaction.update({
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents([
            await VcOffButton.generate(),
          ]),
        ],
      });
    } else
      await interaction.reply({
        content: 'Cant connect to VoiceChannel.',
      });
  },
};

export default handler;
