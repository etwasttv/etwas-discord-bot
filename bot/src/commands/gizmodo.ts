import { BotCommand } from '@/types/command';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { XMLParser } from 'fast-xml-parser';
import { parse } from 'node-html-parser';


const JapanNewsHeadling = 'http://www.gizmodo.jp/atom.xml';
const xmlParser = new XMLParser({ ignoreDeclaration: true, ignoreAttributes: false });

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('gizmodo')
    .setDescription('Gizmodo Rssを利用して記事を表示します'),
  handler: async interaction => {
    if (interaction.user.bot) return;

    await interaction.deferReply();

    const response = await fetch(JapanNewsHeadling);
    const content = await response.text();
    const rss = <GizmodoRss>xmlParser.parse(content);

    const entry = gizmodoEntry2Entry(rss.feed.entry[Math.floor(Math.random() * rss.feed.entry.length)]);

    const page = await fetch(entry.link);
    const pageRoot = parse(await page.text());
    const thumbnail = pageRoot.querySelector('.p-post-thumbnailImage');

    const embed = new EmbedBuilder()
      .setTitle(entry.title)
      .setColor(0x080808)
      .setAuthor({
        name: 'ギズモード・ジャパン',
        url: 'https://www.gizmodo.jp',
      })
      .setURL(entry.link)
      .setDescription(entry.content)
      .setTimestamp(entry.published)
      .setFooter({ text: entry.author });

    if (thumbnail)
      embed.setImage(thumbnail['_attrs']['src']);

    await interaction.editReply({
      embeds: [embed],
    });
  }
}

function gizmodoEntry2Entry(e: GizmodoEntry) {
  return <Entry> {
    title: e.title,
    link: e.link['@_href'],
    author: e.author.name,
    published: new Date(e.published),
    summary: e.summary,
    content: e.content['#text'] + `[${e.content.a['#text']}](${e.content.a['@_href']})`,
  }
}

type Entry = {
  title: string;
  link: string;
  author: string;
  published: Date;
  summary: string;
  content: string;
}

type GizmodoRss = {
  feed: {
    title: string;
    link: any[];
    updated: string;
    id: string;
    subtitle: string;
    entry: GizmodoEntry[];
  }
};

type GizmodoEntry = {
  title: string;
  link: {
    '@_rel': string;
    '@_type': string;
    '@_href': string;
  };
  id: string[];
  summary: string;
  author: {
    name: string;
  };
  published: string;
  updated: string;
  content: {
    '@_type': string;
    '@_xml:lang': string;
    '@_xml:base': string;
    '#text': string;
    a: {
      '@_href': string;
      '#text': string;
    }
  }
}

export default command;
