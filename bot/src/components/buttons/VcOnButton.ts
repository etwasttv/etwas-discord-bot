import { Component } from '@/types/component';
import { ButtonBuilder, ButtonStyle } from 'discord.js';

const customId = 'vc-on-button';

const VcOnButton: Component<ButtonBuilder> = {
  customId,
  generate: async () => new ButtonBuilder()
    .setCustomId(customId)
    .setLabel('読み上げをONにする')
    .setStyle(ButtonStyle.Primary),
}

export { VcOnButton }
