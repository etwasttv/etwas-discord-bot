import {
  type CommandInteraction,
  type SlashCommandBuilder,
  type SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

type CMD =
  | SlashCommandBuilder
  | SlashCommandSubcommandsOnlyBuilder
  | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

type BotCommand = {
  builder: CMD;
  handler: (interaction: CommandInteraction) => Promise<void>;
};

export { BotCommand };
