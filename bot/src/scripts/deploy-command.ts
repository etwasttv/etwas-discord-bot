import "reflect-metadata";

import { BOT_TOKEN, BOT_CLIENT_ID } from "@/config.json";
import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord.js";

import fs from 'fs/promises';
import { BotCommand } from '@/types/command';
import { OmikujiRepository } from '@/repositories/omikujiRepository';
import { RoomConfigRepository } from '@/repositories/roomConfigRepository';
import { VoiceConfigRepository } from '@/repositories/voiceConfigRepository';
import { OmikujiService } from '@/services/Omikuji';
import { RoomService } from '@/services/Room';
import { VoiceService } from '@/services/Voice';
import { container } from 'tsyringe';

container.register('IOmikujiRepository', { useClass: OmikujiRepository });
container.register('IVoiceConfigRepository', { useClass: VoiceConfigRepository });
container.register('IRoomConfigRepository', { useClass: RoomConfigRepository });

container.register('IVoiceService', { useClass: VoiceService });
container.register('IOmikujiService', { useClass: OmikujiService });
container.register('IRoomService', { useClass: RoomService });

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
