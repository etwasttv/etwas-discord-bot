import { TwitchEventSub } from '@/entities';
import { ITwitchEventSubRepository } from '@/repositories/TwitchEventSubRepository';
import { TwitchApiClient } from '@/services/Twitch/TwitchApiClient';
import { ITwitchEventSubService } from '@/services/Twitch/TwitchEventSubService';
import axios from 'axios';
import { inject, injectable } from 'tsyringe';

export interface ITwitchNotificationChannelService {
  subscribe(login: string, guildId: string, channelId: string): Promise<TwitchNotificationSubscribeResult>;
  unsubscribe(login: string, guildId: string, channelId: string): Promise<TwitchNotificationUnsubscribeResult>;
  getSubscriptionList(guildId: string, channelId: string): Promise<TwitchSubscriptionInfo[]>;
}

@injectable()
export class TwitchNotificationChannelService implements ITwitchNotificationChannelService {
  constructor(
    @inject('TwitchApiClient') private api: TwitchApiClient,
    @inject('ITwitchEventSubRepository') private twitchEventSubRepository: ITwitchEventSubRepository,
    @inject('ITwitchEventSubService') private twitchEventSubService: ITwitchEventSubService,
  ) { }

  async subscribe(login: string, guildId: string, channelId: string): Promise<TwitchNotificationSubscribeResult> {
    try {
      const users = await this.api.getUsers({ logins: [login] });
      const broadcasterUserId = users.data[0].id;
      const exists = await this.twitchEventSubRepository.findByBroadcasterUserId(broadcasterUserId);
      await this.twitchEventSubService.subscribe(broadcasterUserId);
      if (exists.find(c => c.channelId === channelId && c.guildId === guildId)) return { status: 'faild', reason: 'Already subscribe!' };
      else await this.twitchEventSubRepository.create(new TwitchEventSub(guildId, channelId, broadcasterUserId));
    } catch (e) {
      if (axios.isAxiosError(e)) return { status: 'faild', reason: `User ${login} not found.` };
      return { status: 'faild' }
    }
    return { status: 'succeeded' };
  }

  async unsubscribe(login: string, guildId: string, channelId: string): Promise<TwitchNotificationUnsubscribeResult> {
    try {
      const users = await this.api.getUsers({ logins: [login] });
      const broadcasterUserId = users.data[0].id;
      const exist = await this.twitchEventSubRepository.find(guildId, channelId, broadcasterUserId);
      if (exist) await this.twitchEventSubRepository.delete(exist);
      const channels = await this.twitchEventSubRepository.findByBroadcasterUserId(broadcasterUserId);
      if (channels.length === 0)
        await this.twitchEventSubService.unsubscribe(broadcasterUserId);
    } catch (e) {
      if (axios.isAxiosError(e)) return { status: 'faild', reason: `User ${login} not found.` };
      return { status: 'faild' }
    }
    return { status: 'succeeded' };
  }

  async getSubscriptionList(guildId: string, channelId: string): Promise<TwitchSubscriptionInfo[]> {
    const channels = await this.twitchEventSubRepository.findByDiscordChannel(guildId, channelId);
    if (channels.length === 0) return [];
    try {
      const users = await this.api.getUsers({ ids: channels.map(c => c.broadcasterUserId) });
      return users.data.map(d => ({ login: d.login, displayName: d.display_name, profile_image_url: d.profile_image_url, description: d.description }));
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}

type TwitchNotificationSubscribeResult = {
  status: 'succeeded'|'faild';
  reason?: string;
}
type TwitchNotificationUnsubscribeResult = {
  status: 'succeeded'|'faild';
  reason?: string;
}
type TwitchSubscriptionInfo = {
  login: string;
  displayName: string;
  description: string;
  profile_image_url: string;
}
