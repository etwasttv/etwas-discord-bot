import { BotCommand } from '@/types/command';
import { CommandInteractionOptionResolver, SlashCommandBuilder } from 'discord.js';
import { parse } from 'csv-parse';
import axios from 'axios';

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('amedas')
    .setDescription('アメダスランキング')
    .addStringOption(opt =>
      opt.setName('category')
        .setDescription('select category')
        .setRequired(true)
        .setChoices(
          { name: '最高気温', value: 'max_temp' },
          { name: '最低気温', value: 'min_temp' },
        )),
  handler: async interaction => {
    if (interaction.user.bot)
      return;

    const options = interaction.options as CommandInteractionOptionResolver;
    const category = options.getString('category');
    await interaction.deferReply();
    try {
      if (category === 'max_temp') {
        const csvRecords = await getMaxTempRanking();

        let ranking = 1;
        let before = NaN;
        const records = csvRecords.map((r, idx) => {
          if (r[9] !== before)
            ranking = idx+1;
          before = r[9];
          return {
            ranking,
            point: r[2].split('（')[0],
            region: r[1],
            value: r[9],
            time: `${r[11].toString().padStart(2, '0')}:${r[12].toString().padStart(2, '0')}`
          };
        });

        await interaction.editReply(getRankingText('今日の最高気温ランキング', records, '℃'));
      }
      else if (category === 'min_temp') {
        const csvRecords = await getMinTempRanking();

        let ranking = 1;
        let before = NaN;
        const records = csvRecords.map((r, idx) => {
          if (r[9] !== before)
            ranking = idx+1;
          before = r[9];
          return {
            ranking,
            point: r[2].split('（')[0],
            region: r[1],
            value: r[9],
            time: `${r[11].toString().padStart(2, '0')}:${r[12].toString().padStart(2, '0')}`
          };
        });

        await interaction.editReply(getRankingText('今日の最低気温ランキング', records, '℃'));
      }
    } catch {
      await interaction.editReply('アメダスの情報を取得できませんでした');
    }
  }
}

type rankingRecord = {
  ranking: number;
  point: string;
  region: string;
  time: string;
  value: number;
}
function getRankingText(title: string, records: rankingRecord[], unit: string) {
  const maxPointNameLength = records.reduce((max, r) => Math.max(max, r.point.length), 0);
  const maxRegionNameLength = records.reduce((max, r) => Math.max(max, r.region.length), 0);
  let rows = [`**${title}**`, '```'];
  for (const record of records) {
    rows.push(`${record.ranking.toString().padStart(2)}位  ${record.point.padEnd(maxPointNameLength, '　')} ${record.region.padEnd(maxRegionNameLength, '　')}  ${record.value.toFixed(1).padStart(4)}${unit} (${record.time})`);
  }
  rows.push('```');
  return rows.join('\n');
}

async function getMinTempRanking(top = 10) {
  const URL = 'https://www.data.jma.go.jp/stats/data/mdrr/tem_rct/alltable/mntemsadext00_rct.csv';
  const response = await axios.get(URL, {
    responseType: 'arraybuffer',
      transformResponse: data => new TextDecoder("shift-jis").decode(data),
  });
  const parser = parse(response.data, {
    on_record: (record, context) => context.lines === 1 ? null : record,
    cast: (value, context) => {
      if (!(context.index === 1 || context.index === 2))
        return Number(value);
      return value;
    }
  });
  type schema = [
    number,string,string,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,
  ];
  const records: schema[] = [];
  for await (const record of parser) {
    records.push(record);
  }
  return records.sort((a, b) => a[9] - b[9]).slice(0, top);
}

async function getMaxTempRanking(top = 10) {
  const URL = 'https://www.data.jma.go.jp/stats/data/mdrr/tem_rct/alltable/mxtemsadext00_rct.csv';
  const response = await axios.get(URL, {
    responseType: 'arraybuffer',
      transformResponse: data => new TextDecoder("shift-jis").decode(data),
  });
  const parser = parse(response.data, {
    on_record: (record, context) => context.lines === 1 ? null : record,
    cast: (value, context) => {
      if (!(context.index === 1 || context.index === 2))
        return Number(value);
      return value;
    }
  });
  type schema = [
    number,string,string,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,
  ];
  const records: schema[] = [];
  for await (const record of parser) {
    records.push(record);
  }
  return records.sort((a, b) => a[9] - b[9]).reverse().slice(0, top);
}

export default command;
