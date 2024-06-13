import "reflect-metadata";

import { container } from 'tsyringe';

import { BOT_TOKEN } from '@/config.json';
import { DiscordClient } from '@/core/discord';


const discordClient = container.resolve(DiscordClient);

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
}

main();
