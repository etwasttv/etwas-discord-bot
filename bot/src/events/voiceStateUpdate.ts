import { Events, VoiceChannel, VoiceState } from "discord.js";
import { DiscordEventListener } from "../lib";
import { joinMember, leaveMember } from "../services/room";
import { CLIENTS } from "..";
import { handleLeaveVC } from "../services/reading";

export const listener = new DiscordEventListener(
  Events.VoiceStateUpdate,
  false,
  async (before: VoiceState, after: VoiceState) => {
    if (before.channelId === after.channelId) return;


    if (before.member?.user.bot || after.member?.user.bot) {
      if (!after.channel && CLIENTS.map(c => c.user?.id).find(id => id === before.member?.user.id)) {
        await handleLeaveVC(before.client, before.guild.id);
      }
      return;
    };


    if (before.channel instanceof VoiceChannel && before.member) {
      await leaveMember(before.channel, before.member);
    }

    if (after.channel instanceof VoiceChannel && after.member) {
      await joinMember(after.channel, after.member);
    }
  }
);
