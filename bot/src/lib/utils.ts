import { Guild, Snowflake, VoiceChannel } from "discord.js";

/**
 * Memberが参加しているVoiceChannelを返す
 * @param guild 
 * @param memberId 
 * @returns Promise<VoiceChannel | undefined>
 */
export async function getVoiceChannel(guild: Guild, memberId: Snowflake) {
  const channels = (await guild.channels.fetch()).filter((v, _k) => v instanceof VoiceChannel);
  return <VoiceChannel>channels.find(v => v?.members.has(memberId));
}
