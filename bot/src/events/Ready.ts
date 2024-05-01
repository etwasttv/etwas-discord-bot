import { Client, Events } from "discord.js";
import { BotEvent } from 'types/event';

const event: BotEvent = {
  eventName: Events.ClientReady,
  once: true,
  listener: async (client: Client) => {
    console.log(`Logged in as ${client.user?.tag}.`);
  },
};

export default event;
