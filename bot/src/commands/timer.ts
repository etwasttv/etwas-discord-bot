import { convertSecondsToTimeString, ITimerService } from '@/services/timer';
import { BotCommand } from '@/types/command';
import { CommandInteractionOptionResolver, Message, SlashCommandBuilder } from 'discord.js';
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
            .setRequired(false)))
    .addSubcommand(cmd =>
      cmd.setName('cancel')
        .setDescription('タイマーを解除する')
        .addStringOption(opt =>
          opt.setName('timer_id')
            .setDescription('解除したいタイマーの Timer Id')
            .setRequired(true)))
    .addSubcommand(cmd =>
      cmd.setName('list')
        .setDescription('設定しているタイマー一覧を表示する')),
  handler: async interaction => {
    if (interaction.user.bot) return;
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
    else if (command === 'cancel') {
      const timerId = options.getString('timer_id');
      if (!timerId) {
        await interaction.reply({
          content: 'Timer Id を指定してください',
        });
        return;
      }
      const result = await service.cancelTimer(interaction.guild, interaction.channel, interaction.user, timerId);
      if (result)
        await interaction.reply(`タイマーを解除しました\n\`Timer Id: ${timerId}\``);
      else
        await interaction.reply('タイマーを解除できませんでした');
    }
    else if (command === 'list') {
      const timers = await service.getTimerList(interaction.guild, interaction.user);
      const timerLists = timers.map((timer) => {
        const startedAt = new Date(timer.scheduledAt);
        startedAt.setUTCSeconds(startedAt.getUTCSeconds() - timer.timerSeconds);
        startedAt.setHours(startedAt.getHours() + 9);
        let msg = '```\n';
        msg += `タイマー: ${convertSecondsToTimeString(timer.timerSeconds)}\n`
        msg += `開始時刻: ${startedAt.getUTCFullYear()}/${(startedAt.getUTCMonth()+1).toString().padStart(2, '0')}/${startedAt.getUTCDate().toString().padStart(2, '0')} ${startedAt.getUTCHours().toString().padStart(2, '0')}:${startedAt.getUTCMinutes().toString().padStart(2, '0')}:${startedAt.getUTCSeconds().toString().padStart(2, '0')}\n`;
        msg += `Timer Id: ${timer.timerId}\n`;
        msg += '```';
        return msg;
      });

      if (timerLists.length === 0) {
        await interaction.reply('今、設定してるタイマーは無いよ！');
        return;
      }

      const perPage = 10;
      const pages = Math.ceil(timers.length / perPage);
      let parent: Message|null = null;
      for (let page = 0; page < pages; page++) {
        const lists = timerLists.slice(page*perPage, Math.min(timerLists.length, (page+1)*perPage));
        const msg = `${page+1}/${pages}` + lists.join('');
        if (!parent)
          await interaction.reply(msg);
        else
          await parent.reply(msg);
        parent = await interaction.fetchReply();
      }
    }
  }
}

export default command;
