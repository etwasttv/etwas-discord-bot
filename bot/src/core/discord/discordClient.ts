import { BotCommand } from '@/types/command';
import { ButtonHandler, StringSelectMenuHandler } from '@/types/component';
import { BotEvent } from '@/types/event';
import { BaseGuildTextChannel, Client, Collection, Events, GatewayIntentBits, MessageCreateOptions, MessagePayload } from 'discord.js';
import { existsSync } from 'fs';
import { readdir } from 'fs/promises';
import path from 'path';
import { singleton } from 'tsyringe';


@singleton()
class DiscordClient {
  private client: Client;
  private token?: string;

  constructor() {
    this.client = new Client({ intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.MessageContent,
    ]});
  }

  async init(token: string): Promise<void> {
    this.token = token;
    await this.addEventListener();
    await this.loadButtonComponents();
    await this.loadStringSelectMenuComponents();
    await this.loadCommands();
    await this.client.login(token);
  }

  async login(token: string): Promise<string> {
    return await this.client.login(token);
  }

  async announce(content: string | MessagePayload | MessageCreateOptions, targets: { guildId: string, channelId: string }[]) {
    console.log('is token set', !!this.token);
    let successCount = 0;
    console.log(targets);
    for (const target of targets) {
      try {
        const guild = await this.client.guilds.fetch(target.guildId);
        const ch = await guild.channels.fetch(target.channelId);
        if (ch instanceof BaseGuildTextChannel) {
          await ch.send(content);
        }
        successCount++;
      } catch (e) {
        console.error(e);
      }
    }
    console.log(`[DiscordClient] Announced something to ${successCount} channels.`);
    return successCount;
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
          this.client.once(
            event.eventName as string, event.listener);
        else
          this.client.on(
            event.eventName as string, event.listener);
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

    this.client.on(Events.InteractionCreate, async interaction => {
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

    this.client.on(Events.InteractionCreate, async interaction => {
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

    this.client.on(Events.InteractionCreate, async interaction => {
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
