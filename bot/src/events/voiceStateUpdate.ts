import { Events, VoiceChannel, VoiceState } from "discord.js";
import { DiscordEventListener } from "../lib";
import { joinMember, leaveMember } from "../services/room";
// import { CLIENTS } from "..";
// import { handleLeaveVC } from "../services/reading";

export const listener = new DiscordEventListener(
  Events.VoiceStateUpdate,
  false,
  async (before: VoiceState, after: VoiceState) => {
    if (before.channelId === after.channelId) return;


    if (before.member?.user.bot || after.member?.user.bot) {
      // const client = CLIENTS.find(c => c.user?.id === before.member?.user.id);
      // if (!after.channel && client) {
        // await handleLeaveVC(client, before.guild.id);
      // }
      return;
    };


    if (before.channel instanceof VoiceChannel && before.member) {
      try {
        await leaveMember(before.channel, before.member);
      } catch (err) {
        console.error(err);
      }
    }

    if (after.channel instanceof VoiceChannel && after.member) {
      try {
        await joinMember(after.channel, after.member);
      } catch (err) {
        console.error(err);
      }
    }
  }
);
