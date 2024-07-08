import { prisma } from '@/core/prisma';
import { TwitchNotificationChannel } from '@/entities';
import { injectable } from 'tsyringe';

interface ITwitchNotificationChannelRepository {
  create(twitchNotificationChannel: TwitchNotificationChannel): Promise<void>;
  delete(twitchNotificationChannel: TwitchNotificationChannel): Promise<void>;
  find(guildId: string, channelId: string, broadcasterUserId: string): Promise<TwitchNotificationChannel|null>;
  findByDiscordChannel(guildId: string, channelId: string): Promise<TwitchNotificationChannel[]>;
  findByBroadcasterUserId(broadcasterUserId: string): Promise<TwitchNotificationChannel[]>;
}

@injectable()
class TwitchNotificationChannelRepository implements ITwitchNotificationChannelRepository {
  async create(twitchNotificationChannel: TwitchNotificationChannel): Promise<void> {
    await prisma.twitchNotificationChannel.create({
      data: {
        guildId: twitchNotificationChannel.guildId,
        channelId: twitchNotificationChannel.channelId,
        broadcasterUserId: twitchNotificationChannel.broadcasterUserId,
      }});
  }
  async delete(twitchNotificationChannel: TwitchNotificationChannel): Promise<void> {
    await prisma.twitchNotificationChannel.delete({
      where: {
        guildId_channelId_broadcasterUserId: {
          guildId: twitchNotificationChannel.guildId,
          channelId: twitchNotificationChannel.channelId,
          broadcasterUserId: twitchNotificationChannel.broadcasterUserId,
        }}});
  }
  async find(guildId: string, channelId: string, broadcasterUserId: string): Promise<TwitchNotificationChannel|null> {
    return await prisma.twitchNotificationChannel.findUnique({
      where: {
        guildId_channelId_broadcasterUserId: {
          guildId: guildId,
          channelId: channelId,
          broadcasterUserId: broadcasterUserId,
        }}});
  }
  async findByDiscordChannel(guildId: string, channelId: string): Promise<TwitchNotificationChannel[]> {
    return await prisma.twitchNotificationChannel.findMany({
      where: {
        guildId: guildId,
        channelId: channelId,
      }});
  }
  async findByBroadcasterUserId(broadcasterUserId: string): Promise<TwitchNotificationChannel[]> {
    return await prisma.twitchNotificationChannel.findMany({
      where: {
        broadcasterUserId: broadcasterUserId,
      }});
  }
}

export { type ITwitchNotificationChannelRepository, TwitchNotificationChannelRepository }
