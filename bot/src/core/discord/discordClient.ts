import { BotCommand } from '@/types/command';
import { ButtonHandler, StringSelectMenuHandler } from '@/types/component';
import { BotEvent } from '@/types/event';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { existsSync } from 'fs';
import { readdir } from 'fs/promises';
import path from 'path';
import { singleton } from 'tsyringe';


@singleton()
class DiscordClient extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
      ]
    });
  }

  async init(): Promise<void> {
    await this.addEventListener();
    await this.loadButtonComponents();
    await this.loadStringSelectMenuComponents();
    await this.loadCommands();
  }

  private async addEventListener(): Promise<number> {
    //  relative path to events folder from this file
    const directoryPath = '../../events';
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
          this.once(event.eventName as string, event.listener);
        else
          this.on(event.eventName as string, event.listener);
      } catch (e) {
        console.error(e);
      }
    }));

    return files.length;
  }

  private async loadButtonComponents(): Promise<number> {
    const handlers = new Collection<string, ButtonHandler>();
    const directoryPath = '../../handlers/buttons';
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

    this.on(Events.InteractionCreate, async interaction => {
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

  private async loadStringSelectMenuComponents(): Promise<number> {
    const handlers = new Collection<string, StringSelectMenuHandler>();
    const directoryPath = '../../handlers/stringSelectMenus';
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

    this.on(Events.InteractionCreate, async interaction => {
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

  private async loadCommands(): Promise<number> {
    const commands = new Collection<string, BotCommand>();
    const directoryPath = '../../commands';
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

    this.on(Events.InteractionCreate, async interaction => {
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
}

export { DiscordClient }
