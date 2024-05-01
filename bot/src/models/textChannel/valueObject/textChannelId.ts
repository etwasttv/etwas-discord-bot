class TextChannelId extends Id {
  constructor(public readonly value: string) {
    if (value.length !== 64)
      throw Error("TextChannel Id is incorrect.");
    super();
  }
  compareTo(A: any): boolean {
    if (!(A instanceof TextChannelId))
      return false;
    return A.value === this.value;
  }
}

export { TextChannelId };
