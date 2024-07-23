import "reflect-metadata";
import 'dotenv/config';

import { container, Lifecycle } from 'tsyringe';

import { DiscordClient } from '@/core/discord';
import { VoiceService } from '@/services/Voice';
import { RoomService } from '@/services/Room';
import { OmikujiService } from '@/services/Omikuji';
import { EmojiService } from '@/services/Emoji';
import { ITimerService, TimerService } from '@/services/timer';

container.register('DiscordClient', { useClass: DiscordClient }, { lifecycle: Lifecycle.Singleton });

container.register('IVoiceService', { useClass: VoiceService });
container.register('IOmikujiService', { useClass: OmikujiService });
container.register('IRoomService', { useClass: RoomService });
container.register('IEmojiService', { useClass: EmojiService });
container.register('ITimerService', { useClass: TimerService }, { lifecycle: Lifecycle.Singleton });


const discordClient = container.resolve<DiscordClient>('DiscordClient');

async function main() {
  if (!process.env.BOT_TOKEN) {
    console.log('TOKEN を指定して下さい');
    return;
  }

  //  初期化
  await discordClient.init();
  const timerService = container.resolve<ITimerService>('ITimerService');
  await timerService.init();

  await discordClient.login(process.env.BOT_TOKEN);
  console.log('Starting Bot');
}

main();
