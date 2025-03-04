import { FastifyRequest } from "fastify";
import { WebSocket } from "ws";
import { SocketService } from "#services/socket.service";
import { EventHandlerService } from "#services/EventHandler.service";

export class SocketController {
  constructor(
    private readonly socketService: SocketService,
    private readonly eventHandlerService: EventHandlerService
  ) {}

  setupTournamentSocket(socket: WebSocket, request: FastifyRequest): void {
    const userId = request.user.userId;
    this.socketService.addClient(socket, userId);
    console.log("Tournament socket connected for user:", userId);

    socket.on("message", (rawMessage) => {
      try {
        console.log("Message received:", rawMessage.toString());
        const { event, data } = JSON.parse(rawMessage.toString());

        const handler = this.eventHandlerService.getEventHandler(event);
        if (handler) {
          handler(socket, data);
        }
      } catch (error) {
        console.error(error);
        socket.send(
          JSON.stringify({
            event: "error",
            data: { message: "Invalid message format" },
          })
        );
      }
    });

    socket.on("close", () => {
      console.log("Tournament socket disconnected for user:", userId);
      this.socketService.removeClient(socket);
    });

    socket.on("error", (error) => {
      console.error("Tournament socket error for user:", userId, error);
      this.socketService.removeClient(socket);
    });
  }

  setupChatSocket(socket: WebSocket, request: FastifyRequest): void {
    console.log("Chat socket connected");
  }
}
