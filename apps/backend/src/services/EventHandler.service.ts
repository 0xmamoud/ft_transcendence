import { WebSocket } from "ws";
import { SocketService } from "#services/socket.service.js";
import { GameService } from "#services/game.service.js";
import { TournamentService } from "#services/tournament.service.js";

interface TournamentEvents {
  join: { tournamentId: number };
  chat: { tournamentId: number; message: string };
  leave: { tournamentId: number };
  start: { tournamentId: number };
  finish: { tournamentId: number };
}

interface MatchEvents {
  ready: { tournamentId: number; matchId: number };
  move: { tournamentId: number; matchId: number; position: number };
}

export class EventHandlerService {
  private eventHandlers: Map<string, (socket: WebSocket, data: any) => void>;
  private gameLoops: Map<number, NodeJS.Timeout>;

  constructor(
    private readonly socketService: SocketService,
    private readonly gameService: GameService,
    private readonly tournamentService: TournamentService
  ) {
    this.eventHandlers = new Map();
    this.gameLoops = new Map();
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

    this.eventHandlers.set("tournament:start", (socket, data) =>
      this.handleTournamentStart(socket, data)
    );

    this.eventHandlers.set("tournament:finish", (socket, data) =>
      this.handleTournamentFinish(socket, data)
    );

    this.eventHandlers.set("match:ready", (socket, data) =>
      this.handleMatchReady(socket, data)
    );

    this.eventHandlers.set("match:move", (socket, data) =>
      this.handleMatchMove(socket, data)
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
      message: `User ${client.userId} has joined the tournament`,
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
      {
        userId: client.userId,
        tournamentId: data.tournamentId,
        message: `User ${client.userId} has left the tournament`,
      },
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

  private handleTournamentStart(
    socket: WebSocket,
    data: TournamentEvents["start"]
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

    this.socketService.broadcastToRoom(data.tournamentId, "tournament:start", {
      userId: client.userId,
      tournamentId: data.tournamentId,
      message: `Tournament ${data.tournamentId} has started`,
      timestamp: new Date().toISOString(),
    });
  }

  private handleTournamentFinish(
    socket: WebSocket,
    data: TournamentEvents["finish"]
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

    this.socketService.broadcastToRoom(data.tournamentId, "tournament:finish", {
      userId: client.userId,
      tournamentId: data.tournamentId,
      message: `Tournament ${data.tournamentId} has finished`,
      timestamp: new Date().toISOString(),
    });
  }

  private async handleMatchReady(
    socket: WebSocket,
    data: MatchEvents["ready"]
  ): Promise<void> {
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

    // Récupérer les informations du match
    const match = await this.tournamentService.getMatch(data.matchId);
    if (!match) return;

    // Créer le jeu s'il n'existe pas déjà
    if (!this.gameService.getGameState(data.matchId)) {
      this.gameService.createGame(
        data.matchId,
        800,
        600,
        match.player1Id,
        match.player2Id
      );
    }

    // Marquer le joueur comme prêt
    const gameState = this.gameService.getGameState(data.matchId);
    if (!gameState) return;

    if (client.userId === gameState.players.player1Id) {
      gameState.players.player1Ready = true;
      console.log("Player 1 ready:", client.userId);
    } else if (client.userId === gameState.players.player2Id) {
      gameState.players.player2Ready = true;
      console.log("Player 2 ready:", client.userId);
    }

    // Vérifier si les deux joueurs sont prêts
    if (gameState.players.player1Ready && gameState.players.player2Ready) {
      console.log("Both players ready, broadcasting match:start event", {
        tournamentId: data.tournamentId,
        matchId: data.matchId,
        userId: client.userId,
        player1Ready: gameState.players.player1Ready,
        player2Ready: gameState.players.player2Ready,
      });

      // Démarrer la boucle de jeu
      this.startGameLoop(data.tournamentId, data.matchId);

      // Notifier les clients que le match commence
      this.socketService.broadcastToRoom(data.tournamentId, "match:start", {
        matchId: data.matchId,
        userId: client.userId,
      });
    } else {
      console.log("Waiting for both players to be ready:", {
        player1Ready: gameState.players.player1Ready,
        player2Ready: gameState.players.player2Ready,
      });
    }
  }

  private handleMatchMove(socket: WebSocket, data: MatchEvents["move"]): void {
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

    const gameState = this.gameService.getGameState(data.matchId);
    if (gameState) {
      this.gameService.movePaddle(data.matchId, "left", data.position);

      this.socketService.broadcastToRoom(data.tournamentId, "match:update", {
        matchId: data.matchId,
        state: this.gameService.getGameState(data.matchId),
      });
    }
  }

  private startGameLoop(tournamentId: number, matchId: number): void {
    if (this.gameLoops.has(matchId)) {
      clearInterval(this.gameLoops.get(matchId));
    }

    const gameLoop = setInterval(() => {
      const gameState = this.gameService.getGameState(matchId);
      if (gameState) {
        this.gameService.updateBall(matchId);

        this.socketService.broadcastToRoom(tournamentId, "match:update", {
          matchId,
          state: this.gameService.getGameState(matchId),
        });

        if (gameState.scores.left >= 11 || gameState.scores.right >= 11) {
          this.endMatch(tournamentId, matchId);
        }
      }
    }, 1000 / 60);

    this.gameLoops.set(matchId, gameLoop);
  }

  private async endMatch(tournamentId: number, matchId: number): Promise<void> {
    const gameState = this.gameService.getGameState(matchId);
    if (!gameState) return;

    // Récupérer les IDs des joueurs
    const player1Id = this.gameService.getPlayer1Id(matchId);
    const player2Id = this.gameService.getPlayer2Id(matchId);

    if (!player1Id || !player2Id) return;

    // Déterminer le gagnant en fonction des scores
    const winnerId = gameState.scores.left >= 11 ? player1Id : player2Id;

    // Arrêter la boucle de jeu
    if (this.gameLoops.has(matchId)) {
      clearInterval(this.gameLoops.get(matchId));
      this.gameLoops.delete(matchId);
    }

    // Supprimer l'état du jeu
    this.gameService.removeGame(matchId);

    // Mettre à jour le match et passer au suivant
    const nextMatch = await this.tournamentService.finishMatch(
      matchId,
      winnerId
    );

    // Notifier les clients de la fin du match
    this.socketService.broadcastToRoom(tournamentId, "match:end", {
      matchId,
      winnerId,
    });

    // Si un nouveau match est disponible, notifier les clients
    if (nextMatch) {
      this.socketService.broadcastToRoom(tournamentId, "tournament:update", {
        message: "Next match is starting",
        nextMatchId: nextMatch.id,
      });
    }
  }
}
