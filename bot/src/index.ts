import "reflect-metadata";

import { container } from 'tsyringe';

import { BOT_TOKEN } from '@/config.json';
import { DiscordClient } from '@/core/discord';
import { VoiceService } from '@/services/Voice';
import { RoomService } from '@/services/Room';
import { OmikujiService } from '@/services/Omikuji';
import { OmikujiRepository } from '@/repositories/omikujiRepository';
import { VoiceConfigRepository } from '@/repositories/voiceConfigRepository';
import { RoomConfigRepository } from '@/repositories/roomConfigRepository';
import { TwitchEventSubSubscriptionRepository } from '@/repositories/TwitchEventSubSubscription';
import { TwitchNotificationChannelRepository } from '@/repositories/TwitchNotificationChannelRepository';
import { TwitchApiClient } from '@/services/Twitch/TwitchApiClient';
import { TwitchNotificationChannelService } from '@/services/Twitch/TwitchNotificationChannelService';
import { ITwitchEventSubService, TwitchEventSubService } from '@/services/Twitch/TwitchEventSubService';

container.register('DiscordClient', { useClass: DiscordClient });

container.register('IOmikujiRepository', { useClass: OmikujiRepository });
container.register('IVoiceConfigRepository', { useClass: VoiceConfigRepository });
container.register('IRoomConfigRepository', { useClass: RoomConfigRepository });
container.register('ITwitchEventSubSubscriptionRepository', { useClass: TwitchEventSubSubscriptionRepository });
container.register('ITwitchNotificationChannelRepository', { useClass: TwitchNotificationChannelRepository });

container.register('TwitchApiClient', { useClass: TwitchApiClient });

container.register('ITwitchEventSubService', { useClass: TwitchEventSubService });
container.register('ITwitchNotificationChannelService', { useClass: TwitchNotificationChannelService });
container.register('IVoiceService', { useClass: VoiceService });
container.register('IOmikujiService', { useClass: OmikujiService });
container.register('IRoomService', { useClass: RoomService });


const discordClient = container.resolve<DiscordClient>('DiscordClient');

async function main() {
  if (!BOT_TOKEN) {
    console.log('TOKEN を指定して下さい');
    return;
  }

  //  初期化
  await discordClient.init();

  //  ログイン
  await discordClient.login(BOT_TOKEN);
  console.log('Starting Bot');

  const service = container.resolve<ITwitchEventSubService>('ITwitchEventSubService');

  setTimeout(() => service.subscribe('etw4s_'), 4000);
}

main();
