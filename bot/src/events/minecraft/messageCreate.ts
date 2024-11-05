import { BotEvent } from '@/types/event';
import { Events, Message } from 'discord.js';

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

    try {
      const res = await fetch(`${process.env.MC_API_ENDPOINT!}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MC_API_TOKEN}`
        },
        body: JSON.stringify({
          name: message.author.displayName,
          chat: message.content,
        }),
      });
    } catch (e) {

    }
  }
}

export default event;
