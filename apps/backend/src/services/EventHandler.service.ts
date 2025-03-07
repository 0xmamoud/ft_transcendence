import { WebSocket } from "ws";
import { SocketService } from "#services/socket.service.js";
import { GameService } from "#services/game.service.js";
import { TournamentService } from "#services/tournament.service.js";
import { MatchService } from "#services/match.service.js";

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
  getState: { tournamentId: number; matchId: number };
}

export class EventHandlerService {
  private eventHandlers: Map<string, (socket: WebSocket, data: any) => void>;
  private gameLoops: Map<number, NodeJS.Timeout>;

  constructor(
    private readonly socketService: SocketService,
    private readonly gameService: GameService,
    private readonly tournamentService: TournamentService,
    private readonly matchService: MatchService
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

    this.eventHandlers.set("match:getState", (socket, data) =>
      this.handleMatchGetState(socket, data)
    );
  }

  getEventHandler(
    event: string
  ): ((socket: WebSocket, data: any) => void) | undefined {
    return this.eventHandlers.get(event);
  }

  private async handleTournamentJoin(
    socket: WebSocket,
    data: TournamentEvents["join"]
  ): Promise<void> {
    const client = this.socketService.getClient(socket);
    if (!client) return;

    this.socketService.joinRoom(socket, data.tournamentId);

    try {
      const participants =
        await this.tournamentService.getTournamentParticipants(
          data.tournamentId
        );

      this.socketService.broadcastToRoom(data.tournamentId, "tournament:join", {
        userId: client.userId,
        tournamentId: data.tournamentId,
        message: `User ${client.userId} has joined the tournament`,
        participants: participants,
      });
    } catch (error: any) {
      console.error("Failed to handle tournament join:", error);
      socket.send(
        JSON.stringify({
          event: "error",
          data: {
            message: error.message || "Failed to join tournament",
          },
        })
      );
    }
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

  private async handleTournamentStart(
    socket: WebSocket,
    data: TournamentEvents["start"]
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

    try {
      await this.tournamentService.startTournament(
        data.tournamentId,
        client.userId
      );

      await this.matchService.createMatches(data.tournamentId);

      await this.matchService.startNextMatch(data.tournamentId);

      const freshMatches = await this.matchService.getTournamentMatches(
        data.tournamentId
      );

      this.socketService.broadcastToRoom(
        data.tournamentId,
        "tournament:start",
        {
          userId: client.userId,
          tournamentId: data.tournamentId,
          message: `Tournament ${data.tournamentId} has started`,
          timestamp: new Date().toISOString(),
          matches: freshMatches,
        }
      );
    } catch (error: any) {
      console.error("Failed to start tournament:", error);
      socket.send(
        JSON.stringify({
          event: "error",
          data: {
            message: error.message || "Failed to start tournament",
          },
        })
      );
    }
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

    const match = await this.matchService.getMatch(data.matchId);
    if (!match) return;

    if (!this.gameService.getGameState(data.matchId)) {
      this.gameService.createGame(
        data.matchId,
        800,
        600,
        match.player1Id,
        match.player2Id
      );
    }

    // Utiliser le nouveau système de ready state
    const bothPlayersReady = this.matchService.setPlayerReady(
      data.matchId,
      client.userId,
      match.player1Id,
      match.player2Id
    );

    // Récupérer l'état actuel des ready
    const readyState = this.matchService.getReadyState(data.matchId);
    if (!readyState) return;

    // Envoyer une mise à jour du ready state à tous les clients
    this.socketService.broadcastToRoom(data.tournamentId, "match:ready", {
      matchId: data.matchId,
      player1Ready: readyState.player1Ready,
      player2Ready: readyState.player2Ready,
    });

    // Si les deux joueurs sont prêts, démarrer le jeu
    if (bothPlayersReady) {
      console.log("Both players ready, starting game", {
        tournamentId: data.tournamentId,
        matchId: data.matchId,
        userId: client.userId,
      });

      this.startGameLoop(data.tournamentId, data.matchId);

      this.socketService.broadcastToRoom(data.tournamentId, "match:start", {
        matchId: data.matchId,
        userId: client.userId,
      });
    } else {
      console.log("Waiting for both players to be ready:", readyState);
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
    if (!gameState) return;

    // Déterminer quel joueur envoie la commande
    const isPlayer1 = client.userId === gameState.players.player1Id;
    const isPlayer2 = client.userId === gameState.players.player2Id;

    // Mettre à jour le paddle correspondant
    if (isPlayer1) {
      this.gameService.movePaddle(data.matchId, "left", data.position);
    } else if (isPlayer2) {
      this.gameService.movePaddle(data.matchId, "right", data.position);
    }

    // Envoyer la mise à jour à tous les clients
    this.socketService.broadcastToRoom(data.tournamentId, "match:update", {
      matchId: data.matchId,
      state: this.gameService.getGameState(data.matchId),
    });
  }

  private handleMatchGetState(
    socket: WebSocket,
    data: MatchEvents["getState"]
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

    try {
      // Récupérer l'état actuel du jeu
      const gameState = this.gameService.getGameState(data.matchId);

      if (!gameState) {
        socket.send(
          JSON.stringify({
            event: "error",
            data: { message: "Game state not found for this match" },
          })
        );
        return;
      }

      // Envoyer l'état du jeu uniquement au client qui l'a demandé
      socket.send(
        JSON.stringify({
          event: "match:update",
          data: {
            matchId: data.matchId,
            state: gameState,
          },
        })
      );

      console.log(
        `Sent game state for match ${data.matchId} to user ${client.userId}`
      );
    } catch (error: any) {
      console.error("Failed to get game state:", error);
      socket.send(
        JSON.stringify({
          event: "error",
          data: {
            message: error.message || "Failed to get game state",
          },
        })
      );
    }
  }

  private startGameLoop(tournamentId: number, matchId: number): void {
    if (this.gameLoops.has(matchId)) {
      clearInterval(this.gameLoops.get(matchId));
      this.gameLoops.delete(matchId);
    }

    // Réduire la fréquence des mises à jour à 30fps au lieu de 60fps
    const gameLoop = setInterval(() => {
      const gameState = this.gameService.getGameState(matchId);
      if (!gameState) {
        // Nettoyer l'intervalle si le jeu n'existe plus
        if (this.gameLoops.has(matchId)) {
          clearInterval(this.gameLoops.get(matchId));
          this.gameLoops.delete(matchId);
        }
        return;
      }

      // Sauvegarder les scores actuels
      const currentScoreLeft = gameState.scores.left;
      const currentScoreRight = gameState.scores.right;

      // Mettre à jour la position de la balle et vérifier les collisions
      this.gameService.updateBall(matchId);

      // Récupérer l'état mis à jour
      const updatedGameState = this.gameService.getGameState(matchId);
      if (!updatedGameState) return;

      // N'envoyer les mises à jour que si nécessaire
      const scoreChanged =
        updatedGameState.scores.left !== currentScoreLeft ||
        updatedGameState.scores.right !== currentScoreRight;

      if (scoreChanged) {
        this.socketService.broadcastToRoom(tournamentId, "match:score", {
          matchId,
          player1Score: updatedGameState.scores.left,
          player2Score: updatedGameState.scores.right,
        });
      }

      // Envoyer la mise à jour de l'état
      this.socketService.broadcastToRoom(tournamentId, "match:update", {
        matchId,
        state: updatedGameState,
      });

      if (
        updatedGameState.scores.left >= 5 ||
        updatedGameState.scores.right >= 5
      ) {
        // Nettoyer l'intervalle avant de terminer le match
        clearInterval(this.gameLoops.get(matchId));
        this.gameLoops.delete(matchId);
        this.endMatch(tournamentId, matchId);
      }
    }, 1000 / 30); // 30fps au lieu de 60fps

    this.gameLoops.set(matchId, gameLoop);
  }

  private async endMatch(tournamentId: number, matchId: number): Promise<void> {
    const gameState = this.gameService.getGameState(matchId);
    if (!gameState) return;

    const player1Id = this.gameService.getPlayer1Id(matchId);
    const player2Id = this.gameService.getPlayer2Id(matchId);

    if (!player1Id || !player2Id) return;

    const winnerId = gameState.scores.left >= 5 ? player1Id : player2Id;
    const player1Score = gameState.scores.left;
    const player2Score = gameState.scores.right;

    if (this.gameLoops.has(matchId)) {
      clearInterval(this.gameLoops.get(matchId));
      this.gameLoops.delete(matchId);
    }

    // Nettoyer le ready state
    this.matchService.resetReadyState(matchId);

    this.gameService.removeGame(matchId);

    try {
      const result = await this.matchService.finishMatch(
        matchId,
        winnerId,
        player1Score,
        player2Score
      );

      const freshMatches = await this.matchService.getTournamentMatches(
        tournamentId
      );

      this.socketService.broadcastToRoom(tournamentId, "match:end", {
        matchId,
        winnerId,
        player1Score,
        player2Score,
        matches: freshMatches,
      });

      const nextMatch = await this.matchService.startNextMatch(
        result.tournamentId
      );

      if (nextMatch === null) {
        const allCompleted = await this.matchService.areAllMatchesCompleted(
          result.tournamentId
        );

        if (allCompleted) {
          await this.tournamentService.finishTournament(result.tournamentId);

          const finalMatches = await this.matchService.getTournamentMatches(
            tournamentId
          );

          this.socketService.broadcastToRoom(
            tournamentId,
            "tournament:finish",
            {
              tournamentId,
              message: "Tournament has been completed",
              matches: finalMatches,
            }
          );

          console.log("Tournament completed:", tournamentId);
        }
      } else {
        console.log("Next match started:", nextMatch.id);
      }
    } catch (error) {
      console.error("Error ending match:", error);
    }
  }
}
