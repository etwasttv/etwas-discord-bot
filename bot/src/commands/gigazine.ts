import { BotCommand } from '@/types/command';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { XMLParser } from 'fast-xml-parser';
import { decode } from 'html-entities';

const RSS = 'https://gigazine.net/news/rss_atom/';
const xmlParser = new XMLParser({
  ignoreDeclaration: true,
  ignoreAttributes: false,
});

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('gigazine')
    .setDescription(
      '日々のあらゆるシーンで役立つ情報を提供するIT系ニュースサイト。毎日更新中。',
    ),
  handler: async (interaction) => {
    await interaction.deferReply();

    const response = await fetch(RSS);
    if (!isStatusOk(response.status)) {
      await interaction.editReply('記事を取得できませんでした');
      return;
    }

    const xml = await response.text();
    const gigazineAtom = <GigazineAtom>xmlParser.parse(xml);

    const entry =
      gigazineAtom.feed.entry[
        Math.floor(Math.random() * gigazineAtom.feed.entry.length)
      ];

    const thumbnailMatch = entry.content['#text'].match(
      /<img src="([^"]+?)".*?>/,
    );
    const thumbnail = thumbnailMatch?.at(1);
    const temp = entry.content['#text'].split(/<br\s*?\/>\s*?<br\s*?\/>/);
    const description = temp[temp.length - 1];

    const embed = new EmbedBuilder()
      .setAuthor({
        name: gigazineAtom.feed.title['#text'],
        url: 'https://gigazine.net/',
      })
      .setTitle(entry.title)
      .setColor(0xffdd00)
      .setURL(entry.link['@_href'])
      .setDescription(
        decode(
          description
            .replace(/<a href="([^"]+?)".*?>(.*?)<\/a>/g, '[$2]($1)')
            .replaceAll('<li>', '\n- <li>')
            .replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, ''),
        ),
      )
      .setTimestamp(new Date(entry.published))
      .setFooter({ text: entry.author.name });

    if (thumbnail) embed.setImage(thumbnail);

    await interaction.editReply({
      embeds: [embed],
    });
  },
};

function isStatusOk(status: number) {
  return 200 <= status && status < 300;
}

type GigazineAtom = {
  feed: {
    title: {
      '#text': string;
    };
    subtitle: {
      '#text': string;
    };
    updated: string;
    rights: string;
    entry: GigazineEntry[];
  };
};

type GigazineEntry = {
  title: string;
  link: {
    '@_href': string;
  };
  id: string;
  published: string;
  updated: string;
  author: {
    name: string;
  };
  category: {
    term: string;
    scheme: string;
    label: string;
  }[];
  content: {
    '#text': string;
  };
};

export default command;
