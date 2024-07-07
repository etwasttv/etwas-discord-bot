import { TwitchEventSubSubscription } from '@/entities';
import { injectable } from 'tsyringe';

interface ITwitchEventSubSubscriptionRepository {
  create(twitchEventSubSubscription: TwitchEventSubSubscription): Promise<void>;
  update(twitchEventSubSubscription: TwitchEventSubSubscription): Promise<void>;
  delete(twitchEventSubSubscription: TwitchEventSubSubscription): Promise<void>;
  findByBroadcasterUserId(broadcasterUserId: string): Promise<TwitchEventSubSubscription>;
  findBySubscriptionId(subscriptionId: string): Promise<TwitchEventSubSubscription>;
}

@injectable()
class TwitchEventSubSubscriptionRepository implements ITwitchEventSubSubscriptionRepository {
  create(twitchEventSubSubscription: TwitchEventSubSubscription): Promise<void> {
    throw new Error('Method not implemented.');
  }
  update(twitchEventSubSubscription: TwitchEventSubSubscription): Promise<void> {
    throw new Error('Method not implemented.');
  }
  delete(twitchEventSubSubscription: TwitchEventSubSubscription): Promise<void> {
    throw new Error('Method not implemented.');
  }
  findByBroadcasterUserId(broadcasterUserId: string): Promise<TwitchEventSubSubscription> {
    throw new Error('Method not implemented.');
  }
  findBySubscriptionId(subscriptionId: string): Promise<TwitchEventSubSubscription> {
    throw new Error('Method not implemented.');
  }

}

export { type ITwitchEventSubSubscriptionRepository, TwitchEventSubSubscriptionRepository }
