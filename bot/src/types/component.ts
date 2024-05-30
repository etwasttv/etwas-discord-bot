import { ButtonBuilder, ButtonInteraction, StringSelectMenuBuilder, StringSelectMenuInteraction } from 'discord.js';

type Component<T extends ButtonBuilder | StringSelectMenuBuilder> = {
  customId: string,
  generate: (...args: any) => Promise<T>;
}
type ButtonHandler = {
  customId: string,
  handler: (interaction: ButtonInteraction) => Promise<void>,
};
type StringSelectMenuHandler = {
  customId: string,
  handler: (interaction: StringSelectMenuInteraction) => Promise<void>,
};
type ComponentHandler = ButtonHandler | StringSelectMenuHandler;

export { Component, ButtonHandler, StringSelectMenuHandler, ComponentHandler }
