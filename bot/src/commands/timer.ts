import { convertSecondsToTimeString, ITimerService } from '@/services/timer';
import { BotCommand } from '@/types/command';
import { CommandInteractionOptionResolver, SlashCommandBuilder } from 'discord.js';
import { container } from 'tsyringe';

const service = container.resolve<ITimerService>('ITimerService');

const command: BotCommand = {
  builder: new SlashCommandBuilder()
    .setName('timer')
    .setDescription('タイマー')
    .addSubcommand(cmd =>
      cmd.setName('set')
        .setDescription('タイマーをセットする')
        .addIntegerOption(opt =>
          opt.setName('seconds')
            .setDescription('秒')
            .setRequired(false)
            .setMinValue(0)
            .setMaxValue(7200))
        .addIntegerOption(opt =>
          opt.setName('minutes')
            .setDescription('分')
            .setRequired(false)
            .setMinValue(0)
            .setMaxValue(1200))
        .addIntegerOption(opt =>
          opt.setName('hours')
            .setDescription('時間')
            .setRequired(false)
            .setMinValue(0)
            .setMaxValue(12))
        .addMentionableOption(opt =>
          opt.setName('mention')
            .setDescription('通知メッセージのメンション先')
            .setRequired(false))
        .addStringOption(opt =>
          opt.setName('message')
            .setDescription('通知メッセージの内容')
            .setRequired(false))),
  handler: async interaction => {
    if (interaction.user.bot) return;
    console.log(interaction.channel);

    const options = interaction.options as CommandInteractionOptionResolver;
    const command = options.getSubcommand(true);

    if (command === 'set') {
      const seconds = options.getInteger('seconds') ?? 0;
      const minutes = options.getInteger('minutes') ?? 0;
      const hours = options.getInteger('hours') ?? 0;
      const mention = options.getMentionable('mention') ?? interaction.user;
      const message = options.getString('message');

      let timerSeconds = seconds + minutes * 60 + hours * 3600;
      if (timerSeconds === 0) {
        await interaction.reply('0秒のタイマーはセットできません');
        return;
      }

      const id = await service.setTimer(interaction.guild, interaction.channel, interaction.user, timerSeconds, mention ? mention.toString() : undefined, message);

      const timeString = convertSecondsToTimeString(timerSeconds);
      let msg = `${timeString}のタイマーをセットしました\n\`Timer Id: ${id}\``;

      await interaction.reply({
        content: msg,
      });
    }
  }
}

export default command;
