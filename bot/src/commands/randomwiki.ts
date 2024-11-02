import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import { BotCommand } from '@/types/command';
import { container } from 'tsyringe';
import { IWikiService } from '@/services/Wiki';

const GoodWiki =
  'https://ja.wikipedia.org/wiki/%E7%89%B9%E5%88%A5:%E3%81%8A%E3%81%BE%E3%81%8B%E3%81%9B%E8%A1%A8%E7%A4%BA';
const service = container.resolve<IWikiService>('IWikiService');

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('randomwiki')
    .setDescription('Wikipediaの記事をランダムで表示する'),
  handler: async (interaction) => {
    if (interaction.user.bot) return;

    await interaction.deferReply();

    const response = await fetch(GoodWiki);
    const splits = response.url.split('/');

    const title = splits[splits.length - 1];

    let description = '';
    try {
      description = await service.getDescription(title);
    } catch {
      console.log('[Wiki] No Description');
    }

    let thumbnail = '';
    try {
      thumbnail = await service.getThumbnail(title);
    } catch {
      console.log('[Wiki] No Thumbnail');
    }

    const embed = new EmbedBuilder()
      .setTitle(decodeURI(title))
      .setURL(response.url)
      .setTimestamp();

    if (description) embed.setDescription(description);
    if (thumbnail) embed.setImage(thumbnail);

    await interaction.editReply({
      content: `あなたにおすすめの記事はこちら！\n`,
      embeds: [embed],
    });
  },
};

export default command;
