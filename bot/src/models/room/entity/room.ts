import { RoomId } from '../valueObject/roomId';

class Room extends Entity {
  get id(): RoomId {
    return this._roomId;
  }
  constructor(private readonly _roomId: RoomId) {
    super(_roomId);
  }
}

export { Room };
