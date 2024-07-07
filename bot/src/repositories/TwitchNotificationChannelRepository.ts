import { TwitchNotificationChannel } from '@/entities';
import { injectable } from 'tsyringe';

interface ITwitchNotificationChannelRepository {
  create(twitchNotificationChannel: TwitchNotificationChannel): Promise<void>;
  update(twitchNotificationChannel: TwitchNotificationChannel): Promise<void>;
  delete(twitchNotificationChannel: TwitchNotificationChannel): Promise<void>;
  findByDiscordChannel(guildId: string, channelId: string): Promise<TwitchNotificationChannel[]>;
  findByBroadcasterUserId(broadcasterUserId: string): Promise<TwitchNotificationChannel[]>;
}

@injectable()
class TwitchNotificationChannelRepository implements ITwitchNotificationChannelRepository {
  create(twitchNotificationChannel: TwitchNotificationChannel): Promise<void> {
    throw new Error('Method not implemented.');
  }
  update(twitchNotificationChannel: TwitchNotificationChannel): Promise<void> {
    throw new Error('Method not implemented.');
  }
  delete(twitchNotificationChannel: TwitchNotificationChannel): Promise<void> {
    throw new Error('Method not implemented.');
  }
  findByDiscordChannel(guildId: string, channelId: string): Promise<TwitchNotificationChannel[]> {
    throw new Error('Method not implemented.');
  }
  findByBroadcasterUserId(broadcasterUserId: string): Promise<TwitchNotificationChannel[]> {
    throw new Error('Method not implemented.');
  }
}

export { type ITwitchNotificationChannelRepository, TwitchNotificationChannelRepository }
