import { type Awaitable, type Events } from 'discord.js';

type BotEvent = {
  eventName: Events,
  once: boolean,
  listener: (...args: any) => Awaitable<void>,
};

export { BotEvent };
