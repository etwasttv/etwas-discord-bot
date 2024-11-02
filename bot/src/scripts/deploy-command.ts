import 'reflect-metadata';

import 'dotenv/config';
import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from 'discord.js';

import fs from 'fs/promises';
import { BotCommand } from '@/types/command';
import { container } from 'tsyringe';

container.register('IVoiceService', { useValue: {} });
container.register('IOmikujiService', { useValue: {} });
container.register('IRoomService', { useValue: {} });
container.register('IEmojiService', { useValue: {} });
container.register('ITimerService', { useValue: {} });
container.register('IWikiService', { useValue: {} });

(async () => {
  const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN!);
  try {
    const files = await fs.readdir(`${__dirname}/../commands`);

    await Promise.all(
      files.map(async (f) => {
        const command: BotCommand = (
          await import(`${__dirname}/../commands/${f}`)
        ).default;
        commands.push(command.builder.toJSON());
      }),
    );

    await rest.put(Routes.applicationCommands(process.env.BOT_CLIENT_ID!), {
      body: commands,
    });
    console.log(`Registered ${commands.length} application commands.`);
  } catch (e) {
    console.error(e);
  }
})();
