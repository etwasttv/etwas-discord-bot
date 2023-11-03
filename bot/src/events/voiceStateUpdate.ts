import { Events, VoiceChannel, VoiceState } from "discord.js";
import { DiscordEventListener } from "../lib";
import { joinMember, leaveMember } from "../services/room";

export const listener = new DiscordEventListener(
  Events.VoiceStateUpdate,
  false,
  async (before: VoiceState, after: VoiceState) => {
    if (before.member?.user.bot || after.member?.user.bot) return;

    if (before.channelId === after.channelId) return;

    if (before.channel instanceof VoiceChannel && before.member) {
      await leaveMember(before.channel, before.member);
    }

    if (after.channel instanceof VoiceChannel && after.member) {
      await joinMember(after.channel, after.member);
    }
  }
);
