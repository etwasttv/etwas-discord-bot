import { VcOffButton } from '@/components/buttons/VcOffButton';
import { VcOnButton } from '@/components/buttons/VcOnButton';
import { IRoomService } from '@/services/Room';
import { IVoiceService } from '@/services/Voice';
import { BotCommand } from '@/types/command';
import { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder, TextChannel } from 'discord.js';
import { container } from 'tsyringe';

const voiceService = container.resolve<IVoiceService>('IVoiceService');
const roomService = container.resolve<IRoomService>('IRoomService');

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('vc')
    .setDescription('Show VC Control Button.'),
  handler: async interaction => {
    if (interaction.user.bot) return;
    if (!interaction.channel) return;

    const voiceChannel = await roomService.getVoiceChannel(interaction.channel as TextChannel);
    if (!voiceChannel) {
      await interaction.reply({
        content: 'Text to voice is not supported in this channel.',
        ephemeral: true,
      });
      return;
    }
    const current = await voiceService.isConnectTo(voiceChannel);

    await interaction.reply({
      components: [new ActionRowBuilder<ButtonBuilder>()
        .addComponents([current ? await VcOffButton.generate() : await VcOnButton.generate()])]});
  },
};

export default command;
