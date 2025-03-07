import { FastifyInstance } from "fastify";
import { SocketService } from "#services/socket.service";
import { EventHandlerService } from "#services/EventHandler.service";
import { GameService } from "#services/game.service";
import { TournamentService } from "#services/tournament.service";
import { MatchService } from "#services/match.service";
import { SocketController } from "#controllers/socket.controller";

async function websocketRoutes(app: FastifyInstance) {
  const socketService = new SocketService();
  const gameService = new GameService();
  const matchService = new MatchService(app);
  const tournamentService = new TournamentService(app, matchService);
  const eventHandlerService = new EventHandlerService(
    socketService,
    gameService,
    tournamentService,
    matchService
  );
  const socketController = new SocketController(
    socketService,
    eventHandlerService
  );

  app.addHook("onRequest", app.authenticate);
  app.get(
    "/",
    { websocket: true },
    socketController.setupTournamentSocket.bind(socketController)
  );
  app.get(
    "/chat",
    { websocket: true },
    socketController.setupChatSocket.bind(socketController)
  );
}

export default websocketRoutes;
