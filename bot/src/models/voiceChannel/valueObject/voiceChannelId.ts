class VoiceChannelId extends Id {
  constructor(public readonly value: string) {
    if (value.length !== 64)
      throw Error("VoiceChannel Id is incorrect.");
    super();
  }
  compareTo(A: any): boolean {
    if (!(A instanceof VoiceChannelId))
      return false;
    return A.value === this.value;
  }
}

export { VoiceChannelId };
