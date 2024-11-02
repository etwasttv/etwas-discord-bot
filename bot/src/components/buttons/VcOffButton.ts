import { Component } from '@/types/component';
import { ButtonBuilder, ButtonStyle } from 'discord.js';

const customId = 'vc-off-button';

const VcOffButton: Component<ButtonBuilder> = {
  customId,
  generate: async () =>
    new ButtonBuilder()
      .setCustomId(customId)
      .setLabel('読み上げをOFFにする')
      .setStyle(ButtonStyle.Danger),
};

export { VcOffButton };
