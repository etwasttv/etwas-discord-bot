import { IMinecraftService } from '@/services/Minecraft';
import { BotEvent } from '@/types/event';
import { Events, Message } from 'discord.js';
import { container } from 'tsyringe';

const minecraftService = container.resolve<IMinecraftService>('IMinecraftService');

const event: BotEvent = {
  eventName: Events.MessageCreate,
  once: false,
  listener: async (message: Message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.channel) return;

    if (message.channelId !== process.env.MC_CHAT_CHANNEL) {
      return;
    }

    await minecraftService.send(message.author.displayName, message.content);
  }
}

export default event;
