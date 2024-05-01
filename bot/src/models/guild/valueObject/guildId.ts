import { Id } from '@/core/models/id';

class GuildId extends Id {
  constructor(public readonly value: string) {
    super();
  }
  compareTo(A: any): boolean {
    if (!(A instanceof GuildId))
      return false;
    return A.value === this.value;
  }
}

export { GuildId };
