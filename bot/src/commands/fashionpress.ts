import { BotCommand } from '@/types/command';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { XMLParser } from 'fast-xml-parser';
import { decode } from 'html-entities';

const RSS = 'http://www.fashion-press.net/news/line.rss';
const xmlParser = new XMLParser({
  ignoreDeclaration: true,
  ignoreAttributes: false,
});

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('fashion-press')
    .setDescription(
      'ファッションブランドを中心に映画、アート、音楽、コスメ、グルメなどを紹介する日本最大級のライフスタイルメディア「ファッションプレス」。おでかけスポットなどの情報も掲載しています。',
    ),
  handler: async (interaction) => {
    await interaction.deferReply();

    const response = await fetch(RSS);
    if (!isStatusOk(response.status)) {
      await interaction.editReply('記事を取得できませんでした');
      return;
    }

    const xml = await response.text();
    const fashionPressRss = <FashionPressRSS>xmlParser.parse(xml);

    const item =
      fashionPressRss.rss.channel.item[
        Math.floor(Math.random() * fashionPressRss.rss.channel.item.length)
      ];
    const title = decode(item.title);
    const link = item.link;
    const description = decode(
      item.description
        .replace(/<a href="([^"]+?)">(.+?)<\/a>/g, '[$2]($1)')
        .replace(/<h\d>(.+?)<\/h\d>/g, '**$1**\n')
        .replace(/<p>(.*?)<\/p>/g, '$1\n')
        .replace(/<br\s*?\/?>/g, '\n')
        .replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '')
        .split('\n')[0],
    );
    const date = new Date(item.pubDate);
    const thumbnail = item['media:content']['@_url'];

    const embed = new EmbedBuilder()
      .setAuthor({
        name: 'ファッションプレス',
        url: 'https://www.fashion-press.net/',
      })
      .setTitle(title)
      .setColor(0xffffff)
      .setURL(link)
      .setDescription(description)
      .setTimestamp(date);

    if (thumbnail) embed.setImage(thumbnail);

    await interaction.editReply({
      embeds: [embed],
    });
  },
};

function isStatusOk(status: number) {
  return 200 <= status && status < 300;
}

type FashionPressRSS = {
  rss: {
    channel: {
      title: string;
      link: string;
      description: string;
      language: string;
      item: FashionPressItem[];
    };
  };
};

type FashionPressItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  'media:content': {
    '@_url': string;
  };
};

export default command;
