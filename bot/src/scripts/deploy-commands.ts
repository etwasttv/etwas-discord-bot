import fs from "fs";
import { BOT_TOKEN, BOT_CLIENT_ID } from "config.json";
import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes
} from "discord.js";
import { AppCommandHandler } from "../lib";
import path from 'path';

(async () => {
  const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

  const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);
  const commandFiles = fs.readdirSync(path.resolve(__dirname, "./commands"));

  await Promise.all(commandFiles.map((file) => 
      import(`./commands/${file}`)
          .then(({ handler }: { handler: AppCommandHandler }) => {
              commands.push(handler.data.toJSON());
  })));

  console.log(commands);

  await rest.put(Routes.applicationCommands(BOT_CLIENT_ID), { body: commands })
    .then(() => console.log(`Registered ${commands.length} application commands.`))
    .catch(console.error);
})();
