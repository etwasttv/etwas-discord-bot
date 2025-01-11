import { ICustomResponseService } from '@/services/CustomResponse';
import { BotEvent } from '@/types/event';
import { Events, Message } from 'discord.js';
import { container } from 'tsyringe';

const service = container.resolve<ICustomResponseService>(
  'ICustomResponseService',
);

const event: BotEvent = {
  eventName: Events.MessageCreate,
  once: false,
  listener: async (message: Message) => {
    if (message.author.bot) return;
    if (!message.guildId) return;
    if (!message.channel) return;

    const splits = message.content.split(/\s/);
    for (const split of splits) {
      const response = await service.searchResponseAsync(
        split,
        message.guildId,
      );
      if (response) message.channel.send(response);
    }
  },
};

export default event;
