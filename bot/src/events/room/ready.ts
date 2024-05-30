import { RoomService } from '@/services/Room';
import { BotEvent } from '@/types/event';
import { Client, Events, VoiceChannel } from 'discord.js';

const roomService = new RoomService();

const event: BotEvent = {
  eventName: Events.ClientReady,
  once: false,
  listener: async (client: Client) => {
    const guilds = await client.guilds.fetch();
    for (const [_1, oA2guild] of guilds) {
      const guild = await oA2guild.fetch();
      const channels = (await guild.channels.fetch()).filter(ch => ch instanceof VoiceChannel);
      for (const [_2, voiceChannel] of channels) {
        if (voiceChannel) await roomService.syncRoom(voiceChannel as VoiceChannel);
      }
    }
  }
}

export default event;
