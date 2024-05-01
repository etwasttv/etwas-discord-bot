import { prisma } from '@/lib/prisma';
import { Member } from '../entity/member';
import { MemberId } from '../valueObject/memberId';

interface IMemberNotification {
  memberId(id: MemberId): void;
}

class MemberNotification {
  private _id: MemberId = new MemberId("");
  memberId(id: MemberId) {
    this._id = new MemberId(id.value);
  }
  get getMemberId(): MemberId {
    return this._id;
  }
}

interface IMemberRepository {
  findById(id: MemberId): Promise<Member|null>;
  save(member: Member): Promise<void>;
}

class PrismaMemberRepository implements IMemberRepository{
  async findById(id: MemberId) {
    const m = await prisma.member.findUnique({
      where: {
        id: id.value,
      }
    });
    if (!m) return null;

    return new Member(new MemberId(m.id));
  }

  async save(member: Member) {
    const note = new MemberNotification();
    member.notify(note);
  }
}

export { IMemberNotification, IMemberRepository, MemberNotification, PrismaMemberRepository };
