import { DiscordClient } from '@/core/discord';
import { prisma } from '@/core/prisma';
import { inject, singleton } from 'tsyringe';

@singleton()
class TimerService {
  private _timers: Set<string> = new Set<string>();

  constructor(@inject('DiscordClient') private discordClient: DiscordClient) {

  }

  async init() {
    const timers = await prisma.timer.findMany({
      where: {
        isCanceled: false,
        isTriggered: false,
      }
    });

    const tasks: Promise<any>[] = [];

    await Promise.all(tasks);
  }

  async setTimer() {

  }

  async cancelTimer() {

  }
}

export { TimerService }
