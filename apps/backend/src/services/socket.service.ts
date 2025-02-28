import { WebSocket } from "ws";

interface Client {
  userId: number;
  rooms: Set<number>;
}

export class SocketService {
  private clients: Map<WebSocket, Client>;

  constructor() {
    this.clients = new Map<WebSocket, Client>();
  }

  addClient(socket: WebSocket, userId: number): void {
    this.clients.set(socket, {
      userId,
      rooms: new Set(),
    });
  }

  getClient(socket: WebSocket): Client | undefined {
    return this.clients.get(socket);
  }

  removeClient(socket: WebSocket): void {
    const client = this.clients.get(socket);
    if (client) {
      client.rooms.forEach((roomId) => {
        this.broadcastToRoom(roomId, "tournament:leave", {
          userId: client.userId,
        });
      });
      this.clients.delete(socket);
    }
  }

  joinRoom(socket: WebSocket, roomId: number): void {
    const client = this.clients.get(socket);
    if (client) {
      client.rooms.add(roomId);
    }
  }

  leaveRoom(socket: WebSocket, roomId: number): void {
    const client = this.clients.get(socket);
    if (client) {
      client.rooms.delete(roomId);
    }
  }

  isInRoom(socket: WebSocket, roomId: number): boolean {
    const client = this.clients.get(socket);
    return client ? client.rooms.has(roomId) : false;
  }

  broadcastToRoom(
    roomId: number,
    event: string,
    data: any,
    excludeSocket?: WebSocket
  ): void {
    const message = JSON.stringify({ event, data });
    this.clients.forEach((clientInRoom, clientSocket) => {
      if (clientInRoom.rooms.has(roomId) && clientSocket !== excludeSocket) {
        clientSocket.send(message);
      }
    });
  }
}
