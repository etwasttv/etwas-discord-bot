import { BotCommand } from '@/types/command';
import { CommandInteractionOptionResolver, SlashCommandBuilder } from 'discord.js';
import { parse } from 'node-html-parser';

const RankingCategory = {
  HighTemperature: 'HIGH_TEMPERATURE',
  LowTemperature: 'LOW_TEMPERATURE',
  Precipitation: 'PRECIPITATION',
  SnowfallAmount: 'SNOWFALL_AMOUNT',
};

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('amedas')
    .setDescription('アメダスランキング')
    .addStringOption(opt =>
      opt.setName('category')
        .setDescription('select category')
        .setRequired(true)
        .setChoices(
          { name: '最高気温', value: RankingCategory.HighTemperature },
          { name: '最低気温', value: RankingCategory.LowTemperature },
          { name: '降水量', value: RankingCategory.Precipitation },
          { name: '積雪量', value: RankingCategory.SnowfallAmount },
        )),
  handler: async interaction => {
    if (interaction.user.bot)
      return;

    const options = interaction.options as CommandInteractionOptionResolver;
    const category = options.getString('category') as Categories;
    if (!category) {
      await interaction.reply({ content: 'カテゴリが見つかりませんでした.', ephemeral: true });
      return;
    }
    await interaction.deferReply();

    const records = await getAmedasRankingFromYahoo(category);

    if (records.length === 0) {
      await interaction.editReply(`${getCategoryString(category)}が観測された地点はありません．`);
      return;
    }

    const maxPointLength = records.reduce((prev, record) => Math.max(prev, record.point.length), 0);

    const unit = '';
    let ranking = `**今日の${getRankingTitle(category)}ランキング**\n`
    ranking= '```\n';
    ranking += records.map(r => `${r.rank.toString().padStart(2, ' ')}位 ${r.point.padStart(maxPointLength, '　')} ${r.value} ${unit} (${r.time})`).join('\n');
    ranking += '\n```';

    await interaction.editReply(ranking);
  }
}

type RankingRecord = {
  rank: number;
  point: string;
  value: string;
  time: string;
}

type Categories = 'HIGH_TEMPERATURE'|'LOW_TEMPERATURE'|'PRECIPITATION'|'SNOWFALL_AMOUNT';

const baseUrl = 'https://weather.yahoo.co.jp/weather/amedas/ranking/?rank=';

async function getAmedasRankingFromYahoo(category: Categories): Promise<RankingRecord[]> {
  const url = baseUrl + getQueryParams(category);
  const page = await fetch(url);
  const html = parse(await page.text());
  const table = html.getElementById('yjw_kakuchi')?.getElementsByTagName('table')[0];
  const rows = table?.childNodes.slice(2);
  if (!table || !rows)
    return [];

  return rows
    .map(r => r.childNodes
      .map(c => c.text.replace(/<.*?>/g, '').trim())
      .filter(s => s.length > 0)
      .filter(r => r.length > 0))
    .filter(r => r.length > 0)
    .map(row => <RankingRecord>{
      rank: Number(row[0]),
      point: row[1],
      value: row[2],
      time: row[3],
    });
}

function getRankingTitle(category: Categories): string {
  switch(category) {
    case 'HIGH_TEMPERATURE':
      return '最高気温';
    case 'LOW_TEMPERATURE':
      return '最低気温';
    case 'PRECIPITATION':
      return '降水量';
    case 'SNOWFALL_AMOUNT':
      return '積雪量';
  }
}

function getCategoryString(category: Categories): string {
  switch(category) {
    case 'HIGH_TEMPERATURE':
      return '気温';
    case 'LOW_TEMPERATURE':
      return '気温';
    case 'PRECIPITATION':
      return '降水';
    case 'SNOWFALL_AMOUNT':
      return '積雪';
  }
}

function getQueryParams(category: Categories): string {
  switch(category) {
    case 'HIGH_TEMPERATURE':
      return 'high_temp';
    case 'LOW_TEMPERATURE':
      return 'low_temp';
    case 'PRECIPITATION':
      return 'precip';
    case 'SNOWFALL_AMOUNT':
      return 'snow';
  }
}

export default command;
