import { Id } from '@/core/models/id';

class TextChannelId extends Id {
  constructor(public readonly value: string) {
    super();
  }
  compareTo(A: any): boolean {
    if (!(A instanceof TextChannelId))
      return false;
    return A.value === this.value;
  }
}

export { TextChannelId };
