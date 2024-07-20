import "reflect-metadata";
import 'dotenv/config';

import { container, Lifecycle } from 'tsyringe';

import { DiscordClient } from '@/core/discord';
import { VoiceService } from '@/services/Voice';
import { RoomService } from '@/services/Room';
import { OmikujiService } from '@/services/Omikuji';
import { OmikujiRepository } from '@/repositories/omikujiRepository';
import { VoiceConfigRepository } from '@/repositories/voiceConfigRepository';
import { RoomConfigRepository } from '@/repositories/roomConfigRepository';
import { EmojiService } from '@/services/Emoji';

container.register('DiscordClient', { useClass: DiscordClient }, { lifecycle: Lifecycle.Singleton });

container.register('IOmikujiRepository', { useClass: OmikujiRepository });
container.register('IVoiceConfigRepository', { useClass: VoiceConfigRepository });
container.register('IRoomConfigRepository', { useClass: RoomConfigRepository });

container.register('IVoiceService', { useClass: VoiceService });
container.register('IOmikujiService', { useClass: OmikujiService });
container.register('IRoomService', { useClass: RoomService });
container.register('IEmojiService', { useClass: EmojiService });


const discordClient = container.resolve<DiscordClient>('DiscordClient');

async function main() {
  if (!process.env.BOT_TOKEN) {
    console.log('TOKEN を指定して下さい');
    return;
  }

  //  初期化
  await discordClient.init(process.env.BOT_TOKEN);

  console.log('Starting Bot');
}

main();
