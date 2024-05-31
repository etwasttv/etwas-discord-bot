import { BOT_TOKEN } from '@/config.json';
import { botClient } from '@/core/discord';
import { BotCommand } from '@/types/command';
import { ButtonHandler, StringSelectMenuHandler } from '@/types/component';
import { BotEvent } from '@/types/event';
import { Collection, Events } from 'discord.js';
import { existsSync } from 'fs';
import { readdir } from 'fs/promises';
import path from 'path';


async function addEventListener(): Promise<number> {
  const directoryPath = 'events';
  if (!existsSync(`${__dirname}/${directoryPath}`))
    return 0;

  const files = (await readdir(`${__dirname}/${directoryPath}`, { recursive: true }))
    .filter(file => path.extname(file) === '.ts' || path.extname(file) === '.js');

  console.log(files);
  await Promise.all(files.map(async file => {
    try {
      const event: BotEvent = (await import(`./${directoryPath}/${file}`)).default;
      if (!event) return;
      if (event.once)
        botClient.once(
          event.eventName as string, event.listener);
      else
        botClient.on(
          event.eventName as string, event.listener);
    } catch (e) {
      console.error(e);
    }
  }));

  return files.length;
}

async function loadButtonComponents(): Promise<number> {
  const handlers = new Collection<string, ButtonHandler>();
  const directoryPath = './handlers/buttons';
  if (!existsSync(`${__dirname}/${directoryPath}`))
    return 0;

  const files = (await readdir(`${__dirname}/${directoryPath}`))
    .filter(file => path.extname(file) === '.ts' || path.extname(file) === '.js');
  await Promise.all(files.map(async file => {
    try {
      const handler: ButtonHandler = (await import(`./${directoryPath}/${file}`)).default;
      if (!handler) return;
      handlers.set(handler.customId, handler);
    } catch (e) {
      console.error(e);
    }
  }));

  botClient.on(Events.InteractionCreate, async interaction => {
    if (interaction.user.bot) return;
    if (interaction.isButton()) {
      try {
        const handler = handlers.get(interaction.customId);
        if (!handler) return;
        await handler.handler(interaction);
      } catch (e) {
        console.error(e);
        await interaction.reply({
          content: 'There was an error while handling button interaction!',
          ephemeral: true,
        });
      }
    }
  });

  return handlers.size;
}

async function loadStringSelectMenuComponents(): Promise<number> {
  const handlers = new Collection<string, StringSelectMenuHandler>();
  const directoryPath = './handlers/stringSelectMenus';
  if (!existsSync(`${__dirname}/${directoryPath}`))
    return 0;

  const files = (await readdir(`${__dirname}/${directoryPath}`))
    .filter(file => path.extname(file) === '.ts' || path.extname(file) === '.js');
  await Promise.all(files.map(async file => {
    try {
      const handler: StringSelectMenuHandler = (await import(`./${directoryPath}/${file}`)).default;
      if (!handler) return;
      handlers.set(handler.customId, handler);
    } catch (e) {
      console.error(e);
    }
  }));

  botClient.on(Events.InteractionCreate, async interaction => {
    if (interaction.user.bot) return;
    if (interaction.isStringSelectMenu()) {
      try {
        const handler = handlers.get(interaction.customId);
        if (!handler) return;
        await handler.handler(interaction);
      } catch (e) {
        console.error(e);
        await interaction.reply({
          content: 'There was an error while handling button interaction!',
          ephemeral: true,
        });
      }
    }
  });

  return handlers.size;
}

async function loadCommands(): Promise<number> {
  const commands = new Collection<string, BotCommand>();
  const directoryPath = './commands';
  if (!existsSync(`${__dirname}/${directoryPath}`))
    return 0;

  const files = (await readdir(`${__dirname}/${directoryPath}`))
    .filter(file => path.extname(file) === '.ts' || path.extname(file) === '.js');
  await Promise.all(files.map(async file => {
    try {
      const command: BotCommand = (await import(`./${directoryPath}/${file}`)).default;
      if (!command) return;
      commands.set(command.builder.name, command);
    } catch (e) {
      console.error(e);
    }
  }));

  botClient.on(Events.InteractionCreate, async interaction => {
    if (interaction.user.bot) return;

    if (interaction.isCommand()) {
      try {
        const command = commands.get(interaction.commandName);
        if (!command) return;
        await command.handler(interaction);
      } catch (e) {
        console.error(e);
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    }
  });

  return commands.size;
}

async function main() {
  if (!BOT_TOKEN) {
    console.log('TOKEN を指定して下さい');
    return;
  }

  const ec = await addEventListener();
  console.log(`Add ${ec} listeners.`);

  const cc = await loadCommands();
  console.log(`Load ${cc} commands.`);
  const ssmcc = await loadStringSelectMenuComponents();
  console.log(`Load ${ssmcc} stringSelectMenuComponents.`);
  const bcc = await loadButtonComponents();
  console.log(`Load ${bcc} buttonComponents`);

  //  ログイン
  console.log('Starting Bot');
  await botClient.login(BOT_TOKEN);
}

main();
