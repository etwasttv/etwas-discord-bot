import { Client, Events } from "discord.js";
import { DiscordEventListener } from "../lib";

export const listener = new DiscordEventListener(
  Events.ClientReady,
  true,
  async (client: Client) => {
    console.log(`Logged in as ${client.user?.tag}.`);
  },
);
