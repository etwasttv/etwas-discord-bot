import { Events, VoiceChannel, VoiceState } from 'discord.js';
import { container } from 'tsyringe';

import { type IRoomService } from '@/services/Room';
import { BotEvent } from '@/types/event';

const roomService = container.resolve<IRoomService>('IRoomService');

const event: BotEvent = {
  eventName: Events.VoiceStateUpdate,
  once: false,
  listener: async (before: VoiceState, after: VoiceState) => {
    if (before.channelId === after.channelId) return;

    if (before.member?.user.bot || after.member?.user.bot) return;

    if (before.channel instanceof VoiceChannel)
      await roomService.syncRoom(before.channel);

    if (after.channel instanceof VoiceChannel)
      await roomService.syncRoom(after.channel);
  },
};

export default event;
