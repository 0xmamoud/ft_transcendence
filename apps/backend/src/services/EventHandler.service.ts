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
      // Récupérer la liste des participants à jour
      const participants =
        await this.tournamentService.getTournamentParticipants(
          data.tournamentId
        );

      // Notifier les clients
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
      // Démarrer le tournoi
      await this.tournamentService.startTournament(
        data.tournamentId,
        client.userId
      );

      // Créer les matchs
      await this.matchService.createMatches(data.tournamentId);

      // Démarrer le premier match
      if (
        (await this.matchService.areAllMatchesCompleted(data.tournamentId)) ===
        false
      ) {
        await this.matchService.startNextMatch(data.tournamentId);
      }

      // Récupérer les matchs à jour depuis la base de données
      const freshMatches = await this.matchService.getTournamentMatches(
        data.tournamentId
      );

      // Notifier les clients
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

    // Récupérer les informations du match
    const match = await this.matchService.getMatch(data.matchId);
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
        // Sauvegarder les scores actuels
        const currentScoreLeft = gameState.scores.left;
        const currentScoreRight = gameState.scores.right;

        // Mettre à jour la position de la balle et vérifier les collisions
        this.gameService.updateBall(matchId);

        // Récupérer l'état mis à jour
        const updatedGameState = this.gameService.getGameState(matchId);
        if (!updatedGameState) return;

        // Vérifier si les scores ont changé
        if (
          updatedGameState.scores.left !== currentScoreLeft ||
          updatedGameState.scores.right !== currentScoreRight
        ) {
          // Envoyer une mise à jour de score aux clients
          this.socketService.broadcastToRoom(tournamentId, "match:score", {
            matchId,
            player1Score: updatedGameState.scores.left,
            player2Score: updatedGameState.scores.right,
          });

          // Ne pas mettre à jour la base de données à chaque changement de score
          // On le fera uniquement à la fin du match
        }

        this.socketService.broadcastToRoom(tournamentId, "match:update", {
          matchId,
          state: updatedGameState,
        });

        // Changer le score gagnant à 5 au lieu de 11
        if (
          updatedGameState.scores.left >= 5 ||
          updatedGameState.scores.right >= 5
        ) {
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
    const winnerId = gameState.scores.left >= 5 ? player1Id : player2Id;
    const player1Score = gameState.scores.left;
    const player2Score = gameState.scores.right;

    // Arrêter la boucle de jeu
    if (this.gameLoops.has(matchId)) {
      clearInterval(this.gameLoops.get(matchId));
      this.gameLoops.delete(matchId);
    }

    // Supprimer l'état du jeu
    this.gameService.removeGame(matchId);

    try {
      // Terminer le match
      const result = await this.matchService.finishMatch(
        matchId,
        winnerId,
        player1Score,
        player2Score
      );

      // Récupérer les matchs à jour
      const freshMatches = await this.matchService.getTournamentMatches(
        tournamentId
      );

      // Notifier les clients de la fin du match
      this.socketService.broadcastToRoom(tournamentId, "match:end", {
        matchId,
        winnerId,
        player1Score,
        player2Score,
        matches: freshMatches,
      });

      // Démarrer le prochain match
      const nextMatch = await this.matchService.startNextMatch(
        result.tournamentId
      );

      // Si aucun prochain match n'est disponible, vérifier si le tournoi est terminé
      if (nextMatch === null) {
        const allCompleted = await this.matchService.areAllMatchesCompleted(
          result.tournamentId
        );

        if (allCompleted) {
          // Terminer le tournoi
          await this.tournamentService.finishTournament(result.tournamentId);

          // Récupérer les matchs finaux
          const finalMatches = await this.matchService.getTournamentMatches(
            tournamentId
          );

          // Notifier les clients que le tournoi est terminé
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
