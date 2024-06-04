import { BotCommand } from '@/types/command';
import { CommandInteractionOptionResolver, SlashCommandBuilder } from 'discord.js';
import { CNNAPI_ENDPOINT } from 'config.json';
import axios from 'axios';

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('vspo')
    .setDescription('画像がVspoの誰かを推測するよ')
    .addAttachmentOption(option =>
      option
        .setName('image')
        .setDescription('分類したい画像')
        .setRequired(true)),
  handler: async interaction => {
    if (interaction.user.bot) return;
    if (!interaction.channel) return;

    const options = interaction.options as CommandInteractionOptionResolver;
    const image = options.getAttachment('image')
    if (!image || !image.url) {
      await interaction.reply('画像が無いかも？');
      return;
    }

    await interaction.deferReply();

    try {
      const file = await axios({
        url: image.url,
        method: 'GET',
        responseType: 'arraybuffer',
      });
      const form = axios.toFormData({});
      form.append('image', file.data, { filename: 'image.png', contentType: 'image/png' });
      const predicted = await axios.postForm(`${CNNAPI_ENDPOINT}/vspo/v1`, form);
      await interaction.editReply({ content: `この画像は \`${predicted.data[1]}\` じゃないかな～`, files: [image.url] });
    } catch (e) {
      console.error(e);
      await interaction.editReply({ content: '予期せぬエラーが発生しました', files: [image.url] });
    }
  },
};

export default command;
