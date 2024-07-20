import { BotCommand } from '@/types/command';
import { AttachmentBuilder, SlashCommandBuilder } from 'discord.js';

const WINDS = ['東', '南', '西', '北'];

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('mahjong')
    .setDescription('配牌ガチャ'),
  handler: async interaction => {
    if (interaction.user.bot) return;
    await interaction.deferReply();

    try {
      const response = await fetch(`${process.env.CNNAPI_ENDPOINT!}/mahjong/tiledealingimg`);
      if (!response.ok) {
        await interaction.editReply({
          content: ':mahjong:',
        });
        return;
      }

      const buffer = await response.arrayBuffer();
      const selfWind = Math.floor(Math.random() * 4);
      const fieldWind = Math.floor(Math.random() * 2);
      let situation = `${WINDS[fieldWind]}場・${WINDS[selfWind]}家`;

      await interaction.editReply({
        content: situation,
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
