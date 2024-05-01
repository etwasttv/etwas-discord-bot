import { Id } from '@/core/models/id';

class MemberId extends Id {
  constructor(public readonly value: string) {
    super();
  }
  compareTo(A: any): boolean {
    if (!(A instanceof MemberId))
      return false;
    return A.value === this.value;
  }
}

export { MemberId };
