import { BOT_TOKEN } from '@/config.json';
import { botClient } from '@/core/discord';
import { BotCommand } from '@/types/command';
import { Collection, Events } from 'discord.js';
import { existsSync } from 'fs';
import { readdir } from 'fs/promises';
import path from 'path';

async function loadCommands(): Promise<number> {
  const commands = new Collection<string, BotCommand>();
  const directoryPath = './commands';
  if (!existsSync(path.resolve(__dirname, directoryPath)))
    return 0;

  const files = await readdir(path.resolve(__dirname, directoryPath));
  await Promise.all(files.map(async file => {
    try {
      const command: BotCommand = (await import(`${directoryPath}/${file}`)).default;
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

  await loadCommands();

  //  ログイン
  console.log('Starting Bot');
  await botClient.login(BOT_TOKEN);
}

main();
