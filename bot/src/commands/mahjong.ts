import { BotCommand } from '@/types/command';
import { AttachmentBuilder, SlashCommandBuilder } from 'discord.js';

import { CNNAPI_ENDPOINT } from 'config.json';

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('mahjong')
    .setDescription('配牌ガチャ'),
  handler: async interaction => {
    if (interaction.user.bot) return;
    await interaction.deferReply();

    try {
      const response = await fetch(`${CNNAPI_ENDPOINT}/mahjong/tiledealingimg`);
      if (!response.ok) {
        await interaction.editReply({
          content: ':mahjong:',
        });
        return;
      }

      const buffer = await response.arrayBuffer();

      await interaction.editReply({
        files: [new AttachmentBuilder(Buffer.from(buffer), {
          name: 'mahjong.png',
        })],
      });
    } catch (e) {
      console.error(e);
      await interaction.editReply({
        content: ':mahjong:',
      });
    }
  },
};

export default command;
