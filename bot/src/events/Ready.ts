import { Client, Events } from "discord.js";
import { DiscordEventListener } from "../lib";
import { checkAll } from "../services/room";

export const listener = new DiscordEventListener(
  Events.ClientReady,
  true,
  async (client: Client) => {
    console.log(`Logged in as ${client.user?.tag}.`);
    await checkAll(client);
  },
);
