import { IMemberNotification } from '@/models/member/repository/memberRepository';
import { MemberId } from '@/models/member/valueObject/memberId';

class Member extends Entity {
  get id(): MemberId {
    return this._id;
  }
  constructor(protected _id: MemberId) {
    super(_id);
  }

  notify(note: IMemberNotification) {
    note.memberId(this.id);
  }
}

export { Member };
