abstract class ValueObject {
  abstract compareTo(A: any): boolean;
}
abstract class SingleValueObject extends ValueObject {
  constructor(protected readonly _value: any) {
    super();
  }
  get value(): any {
    return this._value;
  }
  compareTo(A: any): boolean {
    if (!(A instanceof SingleValueObject))
      return false;
    return A._value === this._value;
  }
}
