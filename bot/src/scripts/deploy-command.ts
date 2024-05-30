import { BOT_TOKEN, BOT_CLIENT_ID } from "@/config.json";
import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord.js";

import fs from 'fs/promises';
import { BotCommand } from '@/types/command';

(async () => {
  const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
  try {
    const files = await fs.readdir(`${__dirname}/../commands`);

    await Promise.all(files.map(async f => {
      const command: BotCommand = (await import(`${__dirname}/../commands/${f}`)).default;
      commands.push(command.builder.toJSON());
    }));

    await rest.put(Routes.applicationCommands(BOT_CLIENT_ID), { body: commands });
    console.log(`Registered ${commands.length} application commands.`);
  } catch (e) {
    console.error(e);
  }

})();
