import { DiscordClient } from '@/core/discord';
import { prisma } from '@/core/prisma';
import { Guild, TextBasedChannel, User } from 'discord.js';
import { inject, singleton } from 'tsyringe';

interface TimerObject {
  timerId?: string;
  guildId: string|null;
  timeoutId: NodeJS.Timeout;
  channelId: string|null;
  userId: string;
  timerSeconds: number;
  scheduledAt: Date;
  mention?: string|null;
  message?: string|null;
}

interface ITimerService {
  init(): Promise<void>;
  setTimer(guild: Guild|null, textChannel: TextBasedChannel|null, user: User, timerSeconds: number, memtion: string|undefined, message: string|undefined|null): Promise<string>;
  cancelTimer(guild: Guild|null, textChannel: TextBasedChannel|null, user: User, timerId: string): Promise<boolean>;
  getTimerList(guild: Guild|null, user: User): Promise<TimerObject[]>;
}

@singleton()
class TimerService implements ITimerService {

  private timerObjects: Map<string, TimerObject> = new Map<string, TimerObject>();

  constructor(@inject('DiscordClient') private discordClient: DiscordClient) {

  }

  async cancelTimer(guild: Guild|null, textChannel: TextBasedChannel|null, user: User, timerId: string): Promise<boolean> {
    try {
      const timer = await prisma.timer.findUnique({
        where: {
          id: timerId,
          isCanceled: false,
          isTriggered: false,
        }
      });
      if (!timer) return false;

      const guildId = guild?.id ?? null;

      if (timer.guildId !== guildId || timer.id !== timerId || timer.userId !== user.id) return false;

      await prisma.timer.update({
        where: {
          id: timerId,
        },
        data: {
          isCanceled: true,
        }
      });
      const timeoutId = this.timerObjects.get(timerId)?.timeoutId;
      if (timeoutId) clearTimeout(timeoutId);
      this.timerObjects.delete(timerId);
    } catch {
      return false;
    }
    return true;
  }

  async getTimerList(guild: Guild|null, user: User): Promise<TimerObject[]> {
    const timers = Array.from(this.timerObjects.values());
    const guildId = guild?.id ?? null;
    return timers.filter(t => t.guildId === guildId && t.userId === user.id);
  }

  async init() {
    const timers = await prisma.timer.findMany({
      where: {
        isCanceled: false,
        isTriggered: false,
      }
    });

    for (const timer of timers) {
      this.initTimer(timer.id, timer.userId, timer.guildId, timer.channelId, timer.timerSeconds, timer.mention, timer.mention, timer.scheduledAt);
    }
  }

  async setTimer(guild: Guild|null, channel: TextBasedChannel|null, user: User, timerSeconds: number, mention: string|undefined = undefined, message: string|undefined = undefined) {
    const scheduledAt = new Date();
    scheduledAt.setUTCSeconds(scheduledAt.getUTCSeconds() + timerSeconds);
    const timer = await prisma.timer.create({
      data: {
        guildId: guild?.id ?? null,
        channelId: channel?.id ?? null,
        userId: user.id,
        timerSeconds: timerSeconds,
        scheduledAt: scheduledAt,
        mention: mention,
        message: message,
      }
    });

    this.initTimer(timer.id, user.id, guild?.id, channel?.id, timerSeconds, mention, message, scheduledAt);

    return timer.id;
  }

  private initTimer(
    timerId: string,
    userId: string,
    guildId: string|undefined|null,
    channelId: string|undefined|null,
    timerSeconds: number,
    mention: string|undefined|null,
    message: string|undefined|null,
    scheduledAt: Date,
  ) {
    if (this.timerObjects.get(timerId)?.timeoutId) return;

    console.log('[Timer] Set Timer');
    const timeoutId = setTimeout(async () => {
      await this.handleTimer(timerId);
    }, scheduledAt.getTime() - Date.now());

    this.timerObjects.set(timerId, {
      userId: userId,
      guildId: guildId ?? null,
      channelId: channelId ?? null,
      timerSeconds: timerSeconds,
      mention: mention,
      message: message,
      scheduledAt,
      timeoutId,
      timerId: timerId,
    });
  }

  private async handleTimer(timerId: string) {
    console.log('[Timer] Timer Triggered');
    const triggeredTimer = await prisma.timer.update({
      where: {
        id: timerId,
      },
      data: {
        isTriggered: true,
      }
    });
    this.timerObjects.delete(timerId);

    let textChannel: TextBasedChannel|null = null;
    if (triggeredTimer.channelId)
      textChannel = await this.discordClient.channels.fetch(triggeredTimer.channelId, { allowUnknownGuild: true }) as TextBasedChannel;
    else
      textChannel = await (await this.discordClient.users.fetch(triggeredTimer.userId)).createDM(true);
    if (!textChannel) return;

    let msg = triggeredTimer.mention ?? '';
    msg += `\n**${convertSecondsToTimeString(triggeredTimer.timerSeconds)}が経過したよ！**\n`;
    msg += triggeredTimer.message ? triggeredTimer.message + '\n' : '';
    msg += `\`Timer Id: ${timerId}\``;
    await textChannel.send(msg);
  }
}

function convertSecondsToTimeString(seconds: number) {
  let timerSeconds = seconds;
  const timerHours = timerSeconds / 3600 | 0;
  timerSeconds %= 3600;
  const timerMinutes = timerSeconds / 60 | 0;
  timerSeconds %= 60;

  let timeString = '';
  if (timerHours > 0)
    timeString += `${timerHours}時間`;
  if (timerMinutes > 0)
    timeString += `${timerMinutes}分`;
  if (timerSeconds > 0)
    timeString += `${timerSeconds}秒`;
  return timeString;
}

export { type ITimerService, TimerService, convertSecondsToTimeString }
