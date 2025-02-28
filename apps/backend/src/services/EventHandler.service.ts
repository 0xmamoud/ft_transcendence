import { WebSocket } from "ws";
import { SocketService } from "./socket.service.js";

interface TournamentEvents {
  join: { tournamentId: number };
  chat: { tournamentId: number; message: string };
  leave: { tournamentId: number };
}

export class EventHandlerService {
  private eventHandlers: Map<string, (socket: WebSocket, data: any) => void>;

  constructor(private readonly socketService: SocketService) {
    this.eventHandlers = new Map();
    this.initializeEventHandlers();
  }

  private initializeEventHandlers(): void {
    this.eventHandlers.set("tournament:join", (socket, data) =>
      this.handleTournamentJoin(socket, data)
    );

    this.eventHandlers.set("tournament:leave", (socket, data) =>
      this.handleTournamentLeave(socket, data)
    );

    this.eventHandlers.set("tournament:chat", (socket, data) =>
      this.handleTournamentChat(socket, data)
    );
  }

  getEventHandler(
    event: string
  ): ((socket: WebSocket, data: any) => void) | undefined {
    return this.eventHandlers.get(event);
  }

  private handleTournamentJoin(
    socket: WebSocket,
    data: TournamentEvents["join"]
  ): void {
    const client = this.socketService.getClient(socket);
    if (!client) return;

    this.socketService.joinRoom(socket, data.tournamentId);

    this.socketService.broadcastToRoom(data.tournamentId, "tournament:join", {
      userId: client.userId,
      tournamentId: data.tournamentId,
    });
  }

  private handleTournamentLeave(
    socket: WebSocket,
    data: TournamentEvents["leave"]
  ): void {
    const client = this.socketService.getClient(socket);
    if (!client) return;

    this.socketService.leaveRoom(socket, data.tournamentId);

    this.socketService.broadcastToRoom(
      data.tournamentId,
      "tournament:leave",
      { userId: client.userId, tournamentId: data.tournamentId },
      socket
    );
  }

  private handleTournamentChat(
    socket: WebSocket,
    data: TournamentEvents["chat"]
  ): void {
    const client = this.socketService.getClient(socket);
    if (!client) return;

    if (!this.socketService.isInRoom(socket, data.tournamentId)) {
      socket.send(
        JSON.stringify({
          event: "error",
          data: { message: "You are not in this tournament" },
        })
      );
      return;
    }

    this.socketService.broadcastToRoom(data.tournamentId, "tournament:chat", {
      userId: client.userId,
      tournamentId: data.tournamentId,
      message: data.message,
      timestamp: new Date().toISOString(),
    });
  }
}
