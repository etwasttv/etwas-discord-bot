import { BotCommand } from '@/types/command';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { XMLParser } from 'fast-xml-parser';
import { link } from 'fs';
import { decode } from 'html-entities';
import { title } from 'process';


const JapanNewsHeadling = 'https://news.google.com/rss/headlines/section/geo/Japan?hl=ja-JP&gl=JP&ceid=JP:ja';

const xmlParser = new XMLParser({ ignoreDeclaration: true, ignoreAttributes: false });

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('news')
    .setDescription('Google News Rssを利用してニュースを表示します'),
  handler: async interaction => {
    if (interaction.user.bot) return;

    await interaction.deferReply();

    const response = await fetch(JapanNewsHeadling);
    const content = await response.text();
    const { rss } = <GoogleNewsRss>xmlParser.parse(content);

    const updatedAt = new Date(rss.channel.lastBuildDate);
    const items: NewsItem[] = rss.channel.item.map(googleNewsItem2NewsItem);

    const rIdx = Math.floor(Math.random() * items.length);
    const rNews = items[rIdx];

    const embed = new EmbedBuilder()
      .setTitle(rNews.title)
      .setURL(rNews.link)
      .setDescription(rNews.description)
      .setTimestamp(rNews.pubDate)
      .setAuthor({
        name: rNews.source,
        url: rNews.sourceLink,
      });

    await interaction.editReply({
      embeds: [embed],
    });
  }
}

function googleNewsItem2NewsItem(i: GoogleNewsItem) {
  

  return<NewsItem>{
    title: i.title,
    link: i.link,
    pubDate: new Date(i.pubDate),
    description: decode(i.description.replace(/<a href="([^"]+?)".*?>(.*?)<\/a>/g, '[$2]($1)').replaceAll('<li>', '\n- <li>').replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '')),
    source: i.source['#text'],
    sourceLink: i.source['@_url'],
  };
}

type NewsItem = {
  title: string;
  link: string;
  pubDate: Date;
  description: string;
  source: string;
  sourceLink: string;
}

type GoogleNewsRss = {
  rss: {
    channel: {
      generator: string;
      title: string;
      link: string;
      language: string;
      webMaster: string;
      copyright: string;
      lastBuildDate: string;
      description: string;
      item: GoogleNewsItem[];
    }
  }
}

type GoogleNewsItem = {
  title: string;
  link: string;
  guid: string;
  pubDate: string;
  description: string;
  source: {
    '#text': string;
    '@_url': string;
  };
}

export default command;
