import { readdir } from 'fs/promises';
import {
  Client,
  Collection,
  CommandInteraction,
  Events,
  GatewayIntentBits
} from 'discord.js';

import { DiscordEventListener, AppCommandHandler, ComponentHandler } from '@/lib';

import { bot_info as BOTINFO } from 'config.json';
import path from 'path';

const CLIENT = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ]
});

export const CLIENTS = [CLIENT];

async function addEventListener(): Promise<number> {
  const files = await readdir(path.resolve(__dirname, './events'));

  await Promise.all(files.map(async file => {
    const { listener } = await import(`./events/${file}`);
    if (!(listener instanceof DiscordEventListener)) return;

    if (listener.once) {
      //  一度だけ実行するイベント
      CLIENT.once(
        (listener.eventName as string),
        (...args) => listener.execute(...args)
      );
    } else {
      //  毎回実行するイベント
      CLIENT.on(
        (listener.eventName as string),
        (...args) => listener.execute(...args)
      );
    }
  }));

  return files.length;
}

async function addCommandHandler(): Promise<number> {
  const handlers = new Collection<string, AppCommandHandler>();
  const files = await readdir(path.resolve(__dirname, './commands'));

  await Promise.all(files.map(async file => {
    const { handler } = await import(`./commands/${file}`);

    if (!(handler instanceof AppCommandHandler)) return;

    handlers.set(handler.data.name, handler);
  }));

  const bHandlers = new Collection<string, ComponentHandler>();
  const bFiles = await readdir(path.resolve(__dirname, './components'));

  await Promise.all(bFiles.map(async file => {
    const { handler } = await import(`./components/${file}`);
    if (!(handler instanceof ComponentHandler)) return;

    bHandlers.set(handler.id, handler);
  }))

  CLIENT.on(Events.InteractionCreate, async interaction => {
    if (interaction.isButton() || interaction.isStringSelectMenu()) {
      const handler = bHandlers.get(interaction.customId);
      if (!handler) {
        return;
      }
      try {
        await handler.handler(interaction);
      } catch (err) {
        console.error(err);
        await interaction.reply({
          content: 'There was an error while executing this button!',
          ephemeral: true,
        });
      }
      return;
    }

    if (!interaction.isCommand()) return;

    if (interaction.user.bot) return;

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
  if (!BOTINFO[0].bot_token) {
    console.log('TOKEN を指定して下さい');
    return;
  }

  //  イベントを読み込む
  const [eventNum, commandNum]
    = await Promise.all([addEventListener(), addCommandHandler()]);
  console.log(`${eventNum} 個のイベント，${commandNum} 個のコマンドを登録しました`);

  //  ログイン
  console.log('Discord Botを起動します');
  CLIENT.login(BOTINFO[0].bot_token);

  for (let i=1; i<BOTINFO.length; i++) {
    const c = new Client({intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
    ]});
    c.login(BOTINFO[i].bot_token);
    CLIENTS.push(c);
  }
}

main();
