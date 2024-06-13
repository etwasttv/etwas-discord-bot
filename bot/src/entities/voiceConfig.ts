class VoiceConfig {
  constructor(
    public readonly guildId: string,
    public readonly userId: string,
    public readonly speakerId: number,
  ) { }
}

export { VoiceConfig }
