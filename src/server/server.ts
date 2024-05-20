import type * as Party from "partykit/server";
import { Vector3 } from 'three';
import { ClientMessage, ServerMessage } from '../utils/constants.ts';
import type { MessageEnvelope } from '../utils/constants.ts';

export default class Server implements Party.Server {
  readonly options = {
    hibernate: false
  };

  roomState: {
    cameraPos: Vector3;
    cameraDirection: Vector3;
    cameraTarget: Vector3;
    playerLock: string | null;
  } = this.getDefaultState();

  getDefaultState() {
    return {
      cameraPos: new Vector3( 0, 20, 100 ),
      cameraDirection: new Vector3(0, 0, 0),
      cameraTarget: new Vector3(0, 0, 0),
      playerLock: null,
    };
  }

  constructor(readonly room: Party.Room) {
    // room defined in built URL /parties/:name/:id
    console.log(`${room.id} started`);
  }

  // async onStart() {}

  async onConnect(connection: Party.Connection, _ctx: Party.ConnectionContext) {

    this.setLastAction(connection);

    connection.send(this.envelope({
      name: ServerMessage.YOUR_INFO,
      playerId: connection.id,
      cameraPos: this.roomState.cameraPos,
      cameraTarget: this.roomState.cameraTarget,
    }))

    connection.send((this.envelope({
      name: ServerMessage.CAMERA_UPDATE,
      cameraPos: this.roomState.cameraPos,
      cameraTarget: this.roomState.cameraTarget,
    })));

    this.room.broadcast(this.envelope({
      name: ServerMessage.PLAYER_CONNECTED,
      playerId: connection.id,
    }));
  }

  // async onClose(connection: Party.Connection) {
  //   // delete room if last connection
  // }

  async onMessage(message: string | ArrayBuffer, sender: Party.Connection) {
    // console.log(message);

    let msg: MessageEnvelope | undefined = undefined;

    try {
      if (typeof message === "string") {
        msg = JSON.parse(message);
      } else {
        throw new Error('message must be a string');
      }
    } catch (e: any) {
      console.error(e.message);
    }

    if (msg === undefined) {
      return;
    }

    switch(msg.name) {
      case(ClientMessage.REQUEST_MOUSE_CONTROL): {
        this.handleMouseMouseLock(sender);
        break;
      }
      case(ClientMessage.MOUSE_LOCK_RELEASED): {
        this.releaseControls(sender.id);
        break;
      }
      case (ClientMessage.MOUSE_POS_UPDATE): {
        this.handleMouseMove(sender, msg);
        break;
      }
      case (ClientMessage.I_AM_HERE): {
        break;
      }
    }
  }

  setLastAction(conn: Party.Connection) {
    if (!conn.state) {
      conn.setState({});
    }
    conn.setState({
      lastAction: Date.now(),
    });
  }

  handleMouseMove(sender: Party.Connection, msg: MessageEnvelope) {
    this.setLastAction(sender);

    if (this.roomState.playerLock === sender.id && msg.isDragging) {
      this.roomState.cameraPos.set(
        msg.cameraPos.x,
        msg.cameraPos.y,
        msg.cameraPos.z,
      );
      this.roomState.cameraTarget.set(
        msg.cameraTarget.x,
        msg.cameraTarget.y,
        msg.cameraTarget.z,
      );

      this.room.broadcast((this.envelope({
        name: ServerMessage.CAMERA_UPDATE,
        cameraPos: this.roomState.cameraPos,
        cameraTarget: this.roomState.cameraTarget,
      })));
    }

    this.room.broadcast(this.envelope({
      name: ServerMessage.MOUSE_POS_UPDATE,
      playerId: sender.id,
      posX: msg.posX,
      posY: msg.posY,
      isDragging: msg.isDragging,
    }));
  }

  lockControls(playerId: string) {
    this.roomState.playerLock = playerId;

    this.room.broadcast(this.envelope({
      name: ServerMessage.MOUSE_PLAYER_LOCKED,
      playerId,
    }));
  }

  releaseControls(playerId: string) {
    if (this.roomState.playerLock === playerId) {
      this.roomState.playerLock = null;

      this.room.broadcast(this.envelope({
        name: ServerMessage.MOUSE_LOCK_RELEASED,
        playerId
      }));
    }
  }

  handleMouseMouseLock(sender: Party.Connection) {
    if (this.roomState.playerLock === null) {
      this.lockControls(sender.id)
    } else if (this.roomState.playerLock !== sender.id) {
      sender.send(this.envelope({
        name: ServerMessage.MOUSE_LOCK_RELEASED,
        access: 'denied',
      }));
    }
  }

  envelope(msgObj: MessageEnvelope) {
    const sendMsg = JSON.stringify(msgObj);
    // console.log(sendMsg)
    return sendMsg;
  }

  // not sure if this is needed for our demo
  // getConnectionTags(
  //   connection: Party.Connection,
  //   ctx: Party.ConnectionContext
  // ) {
  //   const country = (ctx.request.cf?.country as string) ?? "unknown";
  //   return [country];
  // }

  // not sure if this is needed. See https://docs.partykit.io/guides/responding-to-http-requests
  // async onRequest(req: Party.Request) {
  //   return new Response(req.cf.country, { status: 200 });
  // }

  // prob not needed because lobby/room will be known
  // static async onSocket(
  //   socket: Party.FetchSocket,
  //   lobby: Party.FetchLobby,
  //   ctx: Party.ExecutionContext
  // ) {
  //   socket.send("Hello!");
  // }

  // useful to detect hanging connections. See http://localhost:1999/__scheduled__?cron=cron-name
  // {
  //   // ...
  //   "crons": {
  //     "every-minute": "*/1 * * * *",
  //     "every-hour": "0 * * * *",
  //     "every-day": "0 0 * * *"
  //   }
  // }
  // static async onCron(
  //   cron: Party.Cron,
  //   lobby: Party.CronLobby,
  //   ctx: Party.ExecutionContext
  // ) {
  //   console.log(`Running cron ${cron.name} at ${cron.scheduledTime}`);
  //
  //   for (const conn of lobby.parties['default-room'].getConnections()) {
  //     if ((Date.now() - conn.state.lastAction) / 1000 > 5) {
  //       if ((Date.now() - conn.state.lastAction) / 1000 > 30) {
  //         conn.close();
  //       }
  //       conn.send(JSON.stringifyz({
  //         name: ServerMessage.ARE_YOU_THERE,
  //       }));
  //     }
  //   }
  // }

  // async onError(connection: Party.Connection, error: Error) {}


}
