import fs from "fs";
import { bot_token as TOKEN, client_id as CLIENT_ID } from "./config.json";
import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes
} from "discord.js";
import { AppCommandHandler } from "./lib";

(async () => {
  const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

  const rest = new REST({ version: "10" }).setToken(TOKEN);
  const commandFiles = fs.readdirSync("./commands");

  await Promise.all(commandFiles.map((file) => 
      import(`./commands/${file}`)
          .then(({ handler }: { handler: AppCommandHandler }) => {
              commands.push(handler.data.toJSON());
  })));

  console.log(commands);

  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands })
    .then(() => console.log(`Registered ${commands.length} application commands.`))
    .catch(console.error);
})();
