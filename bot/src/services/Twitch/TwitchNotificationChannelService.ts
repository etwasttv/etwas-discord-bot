import { DiscordClient } from '@/core/discord';
import { ITwitchNotificationChannelRepository } from '@/repositories/TwitchNotificationChannelRepository';
import { ITwitchEventSubService } from '@/services/Twitch/TwitchEventSubService';
import { inject, injectable } from 'tsyringe';

export interface ITwitchNotificationChannelService {
  subscribe(broadcasterUserId: string): Promise<void>;
  unsubscribe(): Promise<void>;
  list(): Promise<void>;
}

@injectable()
export class TwitchNotificationChannelService implements ITwitchNotificationChannelService {
  constructor(
    @inject('ITwitchNotificationChannelRepository') private twitchNotificationChannelRepository: ITwitchNotificationChannelRepository,
  ) { }
  subscribe(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  unsubscribe(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  list(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

export type TwitchNotificationHandler = (broadcasterUserId: string) => Promise<void>;
