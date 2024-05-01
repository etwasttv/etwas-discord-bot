import { Id } from '@/core/models/id';

class VoiceChannelId extends Id {
  constructor(public readonly value: string) {
    super();
  }
  compareTo(A: any): boolean {
    if (!(A instanceof VoiceChannelId))
      return false;
    return A.value === this.value;
  }
}

export { VoiceChannelId };
