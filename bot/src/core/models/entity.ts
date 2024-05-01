abstract class Entity {
  constructor(protected readonly _id: Id) {

  }

  get id(): Id {
    return this._id;
  }

  compareTo(A: any): boolean {
    if (!(A instanceof Entity))
      return false;
    return this.id.compareTo(A.id);
  }
}
