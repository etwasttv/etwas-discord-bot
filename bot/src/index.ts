import { readdir } from 'fs/promises';
import { Client, Collection, CommandInteraction, Events, GatewayIntentBits } from 'discord.js';

import { DiscordEventListener, AppCommandHandler } from './lib';

import { bot_token as TOKEN } from './config.json';

const CLIENT = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ]
});

async function addEventListener(): Promise<number> {
  const files = await readdir('./events');

  await Promise.all(files.map(async file => {
    const { listener } = await import(`./events/${file}`);
    if (!(listener instanceof DiscordEventListener)) return;

    if (listener.once) {
      //  一度だけ実行するイベント
      CLIENT.once((listener.eventName as string), (...args) => listener.execute(...args));
    } else {
      //  毎回実行するイベント
      CLIENT.on((listener.eventName as string), (...args) => listener.execute(...args));
    }
  }));

  return files.length;
}

async function addCommandHandler(): Promise<number> {
  const handlers = new Collection<string, AppCommandHandler>();

  const files = await readdir('./commands');

  await Promise.all(files.map(async file => {
    const { handler } = await import(`./comands/${file}`);

    if (!(handler instanceof AppCommandHandler)) return;

    handlers.set(handler.data.name, handler);
  }));

  CLIENT.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) return;

    if (!interaction.user.bot) return;

    const handler = handlers.get(interaction.commandName);

    if (!handler) return;

    try {
      await handler.handler(<CommandInteraction>interaction);
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  });

  return handlers.size;
}

async function main() {
  if (!TOKEN) {
    console.log('TOKEN を指定して下さい');
    return;
  }

  //  イベントを読み込む
  const [eventNum, commandNum] = await Promise.all([addEventListener(), addCommandHandler()]);
  console.log(`${eventNum} 個のイベント，${commandNum} 個のコマンドを登録しました`);

  //  ログイン
  console.log('Discord Botを起動します');
  CLIENT.login(TOKEN);
}

main();
