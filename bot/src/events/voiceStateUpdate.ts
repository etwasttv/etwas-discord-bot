import { UserJoinRoomAppService } from '@/services/room/userJoinRoomAppService';
import { UserLeaveRoomAppService } from '@/services/room/userLeaveRoomAppService';
import { Events, VoiceChannel as DiscordVoiceChannel, VoiceState } from "discord.js";
import { BotEvent } from 'types/event';

const userJoinRoomAppService = new UserJoinRoomAppService();
const userLeaveRoomAppService = new UserLeaveRoomAppService();

const event: BotEvent = {
  eventName: Events.VoiceStateUpdate,
  once: false,
  listener: async (before: VoiceState, after: VoiceState) => {
    if (before.channelId === after.channelId) return;

    if (before.channel instanceof DiscordVoiceChannel && before.member && before.channelId) {
      await userLeaveRoomAppService.execute(before.channel, before.member);
    }

    if (after.channel instanceof DiscordVoiceChannel && after.member && after.channelId) {
      await userJoinRoomAppService.execute(after.channel, after.member);
    }
  }
};

export default event;
