import { IPaperService } from '@/services/Paper';
import { BotCommand } from '@/types/command';
import { SlashCommandBuilder } from 'discord.js';
import { container } from 'tsyringe';

const service = container.resolve<IPaperService>('IPaperService');

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('paper')
    .setDescription('Check paper update'),
  handler: async (interaction) => {
    if (interaction.user.bot) return;

    await interaction.deferReply();

    const version = await service.getLatestBuild();
    console.log(version);
    if (!version) {
      await interaction.editReply('取得失敗');
      return;
    }

    let msg = `Paperの最新の成功ビルドはMinecraft${version?.mcVersion}Build${version?.buildNumber}です\n`;
    msg += `ダウンロードコマンド: \`${getCommand(version?.mcVersion, version?.buildNumber)}\``;

    await interaction.editReply({
      content: msg,
    });
  },
};

function getCommand(mcVersion: string, buildNum: string) {
  return `wget https://api.papermc.io/v2/projects/paper/versions/${mcVersion}/builds/${buildNum}}/downloads/paper-${mcVersion}-${buildNum}.jar`;
}

export default command;
