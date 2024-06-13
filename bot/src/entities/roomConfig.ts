class RoomConfig {
  constructor(
    public readonly roomId: string|undefined,
    public readonly guildId: string,
    public readonly voiceChannelId: string,
    public readonly textChannelId: string|null,
    public readonly voice: boolean,
  ) { }
}

export { RoomConfig }
