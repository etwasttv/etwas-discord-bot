class GuildId extends Id {
  constructor(public readonly value: string) {
    if (value.length !== 64)
      throw Error("Member Id is incorrect.");
    super();
  }
  compareTo(A: any): boolean {
    if (!(A instanceof GuildId))
      return false;
    return A.value === this.value;
  }
}

export { GuildId };
