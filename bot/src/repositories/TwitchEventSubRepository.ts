import { prisma } from '@/core/prisma';
import { TwitchEventSub } from '@/entities';
import { injectable } from 'tsyringe';

interface ITwitchEventSubRepository {
  create(twitchEventSub: TwitchEventSub): Promise<void>;
  delete(twitchEventSub: TwitchEventSub): Promise<void>;
  find(guildId: string, channelId: string, broadcasterUserId: string): Promise<TwitchEventSub|null>;
  findByDiscordChannel(guildId: string, channelId: string): Promise<TwitchEventSub[]>;
  findByBroadcasterUserId(broadcasterUserId: string): Promise<TwitchEventSub[]>;
  getBroadcasterIds(): Promise<string[]>;
}

@injectable()
class TwitchEventSubRepository implements ITwitchEventSubRepository {
  async create(twitchEventSub: TwitchEventSub): Promise<void> {
    await prisma.twitchEventSub.create({
      data: {
        guildId: twitchEventSub.guildId,
        channelId: twitchEventSub.channelId,
        broadcasterUserId: twitchEventSub.broadcasterUserId,
      }});
  }
  async delete(twitchEventSub: TwitchEventSub): Promise<void> {
    await prisma.twitchEventSub.delete({
      where: {
        guildId_channelId_broadcasterUserId: {
          guildId: twitchEventSub.guildId,
          channelId: twitchEventSub.channelId,
          broadcasterUserId: twitchEventSub.broadcasterUserId,
        }}});
  }
  async find(guildId: string, channelId: string, broadcasterUserId: string): Promise<TwitchEventSub|null> {
    return await prisma.twitchEventSub.findUnique({
      where: {
        guildId_channelId_broadcasterUserId: {
          guildId: guildId,
          channelId: channelId,
          broadcasterUserId: broadcasterUserId,
        }}});
  }
  async findByDiscordChannel(guildId: string, channelId: string): Promise<TwitchEventSub[]> {
    return await prisma.twitchEventSub.findMany({
      where: {
        guildId: guildId,
        channelId: channelId,
      }});
  }
  async findByBroadcasterUserId(broadcasterUserId: string): Promise<TwitchEventSub[]> {
    return await prisma.twitchEventSub.findMany({
      where: {
        broadcasterUserId: broadcasterUserId,
      }});
  }
  async getBroadcasterIds(): Promise<string[]> {
    const cs = await prisma.twitchEventSub.groupBy({
      by: 'broadcasterUserId',
    });
    return cs.map(c => c.broadcasterUserId);
  }
}

export { type ITwitchEventSubRepository, TwitchEventSubRepository }
