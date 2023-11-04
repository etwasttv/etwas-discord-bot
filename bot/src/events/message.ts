import { Events, Message } from "discord.js";
import { DiscordEventListener } from "../lib"; 
import { getVoiceChannel } from "../lib/utils";
import { prisma } from '../lib/prisma';
import { isOnZundamon, readText } from "../services/reading";

export const listener = new DiscordEventListener(
  Events.MessageCreate,
  false,
  async (message: Message) => {
    if (!message.guild) return;

    const voiceChannel = await getVoiceChannel(message.guild, message.author.id);
    if (!voiceChannel) return;

    const member = await prisma.member.findUnique({
      where: {
        id: message.author.id,
      },
      include: {
        room: true,
      },
    });

    if (!member) return;

    if (member.room?.textChannelId !== message.channelId) return;
    if (await isOnZundamon(voiceChannel)) {
      await readText(
        voiceChannel.id,
        voiceChannel.guildId,
        message.content,
        member.speakerId,
        member.speedScale,
        member.pitchScale,
        member.intonationScale,
      );
    }
  },
);
