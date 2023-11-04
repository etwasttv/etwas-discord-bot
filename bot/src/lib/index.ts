import {
  AnySelectMenuInteraction,
  Awaitable,
  ButtonBuilder,
  ButtonInteraction,
  CommandInteraction,
  Interaction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  StringSelectMenuInteraction
} from "discord.js";

export class DiscordEventListener {
  eventName: string;
  once: boolean;
  execute: (...args: any[]) => Awaitable<void>;
  constructor(
    eventName: string,
    once: boolean,
    execute: (...args: any[]) => Awaitable<void>
  ) {
    this.eventName = eventName;
    this.once = once;
    this.execute = execute;
  }
};

type CMD = SlashCommandBuilder
         | SlashCommandSubcommandsOnlyBuilder
         | Omit<SlashCommandBuilder, 'addSubcommand'|'addSubcommandGroup'>;

export class AppCommandHandler {
  data: CMD;
  handler: (interaction: CommandInteraction) => Promise<void>;
  constructor(
    data: CMD,
    handler: (interaction: CommandInteraction) => Promise<void>
  ) {
    this.data = data;
    this.handler = handler;
  }
}

export class ComponentHandler {
  id: string;
  handler: (interaction: ButtonInteraction|StringSelectMenuInteraction) => Promise<void>;
  constructor(
    id: string,
    handler: (interaction: ButtonInteraction|StringSelectMenuInteraction) => Promise<void>,
  ) {
    this.id = id;
    this.handler = handler;
  }
}
