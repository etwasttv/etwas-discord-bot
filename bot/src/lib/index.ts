import { Awaitable, CommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

export class DiscordEventListener {
  eventName: string;
  once: boolean;
  execute: (...args: any[]) => Awaitable<void>;
  constructor(eventName: string, once: boolean, execute: (...args: any[]) => Awaitable<void>) {
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
  constructor(data: CMD, handler: (interaction: CommandInteraction) => Promise<void>) {
    this.data = data;
    this.handler = handler;
  }
}
