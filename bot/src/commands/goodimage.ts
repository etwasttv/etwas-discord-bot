import { SlashCommandBuilder } from 'discord.js';

import { BotCommand } from '@/types/command';

const GoodWiki = 'https://ja.wikipedia.org/wiki/%E7%89%B9%E5%88%A5:%E3%82%AB%E3%83%86%E3%82%B4%E3%83%AA%E5%86%85%E3%81%8A%E3%81%BE%E3%81%8B%E3%81%9B%E8%A1%A8%E7%A4%BA/%E7%A7%80%E9%80%B8%E3%81%AA%E7%94%BB%E5%83%8F';

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('goodimage')
    .setDescription('秀逸な画像をランダムで表示する'),
  handler: async interaction => {
    if (interaction.user.bot)
      return;

    const response = await fetch(GoodWiki);

    await interaction.reply({
      content: response.url,
    });
  }
}

export default command;
