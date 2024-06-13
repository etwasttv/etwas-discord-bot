import { IRoomService } from '@/services/Room';
import { IVoiceService } from '@/services/Voice';
import { type BotEvent } from '@/types/event';
import { Events, type Message, type TextChannel } from 'discord.js';
import { container } from 'tsyringe';

const voiceService = container.resolve<IVoiceService>('IVoiceService');
const roomService = container.resolve<IRoomService>('IRoomService');

const event: BotEvent = {
  eventName: Events.MessageCreate,
  once: false,
  listener: async (message: Message) => {
    if (message.author.bot)
      return;
    if (!message.guild)
      return;
    if (!message.channel)
      return;

    const voiceChannel = await roomService.getVoiceChannel(message.channel as TextChannel);
    if (!voiceChannel)
      return;

    console.log(`[Voice] Try Reading`);
    await voiceService.read(voiceChannel, message.author, message.content);
  }
}

export default event;
