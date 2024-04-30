import { Client, Events } from "discord.js";
import { checkAll } from "services/room";
import { BotEvent } from 'types/event';

const event: BotEvent = {
  eventName: Events.ClientReady,
  once: true,
  listener: async (client: Client) => {
    console.log(`Logged in as ${client.user?.tag}.`);
    await checkAll(client);
  },
};

export default event;
