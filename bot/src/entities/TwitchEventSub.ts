class TwitchEventSub {
  constructor(
    public readonly guildId: string,
    public readonly channelId: string,
    public readonly broadcasterUserId: string,
  ) { }
}

export { TwitchEventSub }
