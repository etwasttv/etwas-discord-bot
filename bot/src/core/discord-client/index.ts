import { Client, GatewayIntentBits } from 'discord.js';

const discordClientSingleton = () => {
  return new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
  ]});
}

type DiscordClientSingleton = ReturnType<typeof discordClientSingleton>;

const globalForDiscord = globalThis as unknown as {
  discord: DiscordClientSingleton | undefined,
};

export const discordClient = globalForDiscord.discord ?? discordClientSingleton();

globalForDiscord.discord = discordClient;
