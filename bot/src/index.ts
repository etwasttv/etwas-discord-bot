import { readdir } from 'fs/promises';
import path from 'path';

import {
  Collection,
  CommandInteraction,
  Events,
} from 'discord.js';

import { discordClient as CLIENT } from './core/discord-client';
// import { BOT_TOKEN } from '../config.json';
import { BotCommand } from './types/command';
import { BotEvent } from './types/event';
const BOT_TOKEN = "";

async function addEventListener(): Promise<number> {
  const files = (await readdir(path.resolve(__dirname, './events'), { recursive: true }))
    .filter(f => path.extname(f) === '.ts' || path.extname(f) === '.js');

  await Promise.all(files.map(async file => {
    const event: BotEvent = (await import(`./events/${file}`)).default;
    if (!event) return;

    if (event.once) {
      //  execute only once
      CLIENT.once(
        event.eventName as string,
        (...args) => event.listener(...args)
      );
    } else {
      //  execute everytime
      CLIENT.on(
        event.eventName as string,
        (...args) => event.listener(...args)
      );
    }
  }));

  return files.length;
}

async function registerCommand(): Promise<number> {
  const commands = new Collection<string, BotCommand>();
  const files = await readdir(path.resolve(__dirname, './commands'));
  await Promise.all(files.map(async file => {
    try {
      const command: BotCommand = (await import(`./commands/${file}`)).default;

      if (!command) return;

      commands.set(command.builder.name, command);
    } catch (e) {
      console.error(e);
    }
  }));

  //  register
  CLIENT.on(Events.InteractionCreate, async interaction => {
    if (interaction.user.bot) return;
    if (!interaction.isCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
      //  execute
      await command.handler(<CommandInteraction>interaction);
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  });

  return commands.size;
}

async function main() {
  if (BOT_TOKEN) {
    console.log('TOKEN を指定して下さい');
    return;
  }

  //  イベントを読み込む
  const [eventNum, commandNum]
    = await Promise.all([addEventListener(), registerCommand()]);
  console.log(`${eventNum} 個のイベント，${commandNum} 個のコマンドを登録しました`);

  //  ログイン
  console.log('Discord Botを起動します');
  CLIENT.login(BOT_TOKEN);
}

main();
