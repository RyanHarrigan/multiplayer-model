export type MessageEnvelope = { name: ServerMessage | ClientMessage, [key: string]: any; };

export type MousePos = {
  posX: number;
  posY: number;
  isDragging: boolean;
};

  export enum ClientMessage {
  // REQUEST_ROOM_INFO,
  REQUEST_CAMERA_RESPONSE,
  REQUEST_MOUSE_CONTROL,
  MOUSE_LOCK_RELEASED,
  MOUSE_POS_UPDATE,
  // REQUEST_MODEL_CHANGE,
  I_AM_HERE, // to detect hanging connections
}

export enum ServerMessage {
  // REQUEST_CAMERA,
  YOUR_INFO,
  CAMERA_UPDATE,
  MOUSE_PLAYER_LOCKED,
  MOUSE_LOCK_RELEASED,
  MOUSE_POS_UPDATE,
  PLAYER_CONNECTED,
  PLAYER_DISCONNECTED,
  ARE_YOU_THERE, // to detect hanging connections
}
