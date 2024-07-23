import { SlashCommandBuilder } from 'discord.js';

import { BotCommand } from '@/types/command';

const GoodWiki = 'https://ja.wikipedia.org/wiki/%E7%89%B9%E5%88%A5:%E3%82%AB%E3%83%86%E3%82%B4%E3%83%AA%E5%86%85%E3%81%8A%E3%81%BE%E3%81%8B%E3%81%9B%E8%A1%A8%E7%A4%BA/%E8%89%AF%E8%B3%AA%E3%81%AA%E8%A8%98%E4%BA%8B';

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('goodwiki')
    .setDescription('良質な記事をランダムで表示する'),
  handler: async interaction => {
    if (interaction.user.bot)
      return;

    const response = await fetch(GoodWiki);

    await interaction.reply({
      content: `あなたにおすすめの良質な記事は[こちら](${response.url})！\n`,
    });
  }
}

export default command;
