import { Events, Message } from "discord.js";
import { getVoiceChannel } from "../lib/utils";
import { prisma } from 'lib/prisma';
import { BotEvent } from 'types/event';
// import { isOnZundamon, readText } from "../services/reading";

const event: BotEvent = {
  eventName: Events.MessageCreate,
  once: false,
  listener: async (message: Message) => {
    if (!message.guild) return;

    const voiceChannel = await getVoiceChannel(message.guild, message.author.id);
    if (!voiceChannel) return;

    //  Todo: ddd
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
    // if (await isOnZundamon(voiceChannel)) {
    //   try {
    //     await readText(
    //       voiceChannel.id,
    //       voiceChannel.guildId,
    //       message.content,
    //       member.speakerId,
    //       member.speedScale,
    //       member.pitchScale,
    //       member.intonationScale,
    //     );
    //   } catch (err) {
    //     console.error(err);
    //   }
    // }
  },
};

export default event;
