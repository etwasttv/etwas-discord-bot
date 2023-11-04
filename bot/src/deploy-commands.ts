import fs from "fs";
import { bot_info as BOTINFO } from "./config.json";
import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes
} from "discord.js";
import { AppCommandHandler } from "./lib";

(async () => {
  const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

  const rest = new REST({ version: "10" }).setToken(BOTINFO[0].bot_token);
  const commandFiles = fs.readdirSync("./commands");

  await Promise.all(commandFiles.map((file) => 
      import(`./commands/${file}`)
          .then(({ handler }: { handler: AppCommandHandler }) => {
              commands.push(handler.data.toJSON());
  })));

  console.log(commands);

  await rest.put(Routes.applicationCommands(BOTINFO[0].client_id), { body: commands })
    .then(() => console.log(`Registered ${commands.length} application commands.`))
    .catch(console.error);
})();
