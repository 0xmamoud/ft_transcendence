import { WebSocket } from "ws";
import { SocketService } from "#services/socket.service.js";
import { GameService } from "#services/game.service.js";
import { TournamentService } from "#services/tournament.service.js";
import { MatchService } from "#services/match.service.js";
import { FastifyInstance } from "fastify";
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
    private readonly matchService: MatchService,
    private readonly app: FastifyInstance
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

    // this.eventHandlers.set("tournament:finish", (socket, data) =>
    //   this.handleTournamentFinish(socket, data)
    // );

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

  // TODO: store matchs on blockchain
  private async handleTournamentFinish(tournamentId: number): Promise<void> {
    const matches = await this.matchService.getTournamentMatches(tournamentId);

    const allCompleted = matches.every((match) => match.status === "COMPLETED");
    if (!allCompleted) return;

    const winCounts = new Map<number, number>();
    matches.forEach((match) => {
      if (!match.winnerId) return;
      winCounts.set(match.winnerId, (winCounts.get(match.winnerId) || 0) + 1);
    });

    let maxWins = 0;
    let winnerId: number | null = null;

    winCounts.forEach((wins, playerId) => {
      if (wins > maxWins) {
        maxWins = wins;
        winnerId = playerId;
      }
    });

    if (winnerId) {
      const tournament = await this.tournamentService.getTournament(
        tournamentId
      );
      if (!tournament) return;

      const winnerParticipant = tournament.participants.find(
        (p) => p.userId === winnerId
      );
      if (!winnerParticipant) return;

      await this.tournamentService.finishTournament(tournamentId, winnerId);
      const userAvatar = await this.app.db.user.findUnique({
        where: { id: winnerId },
        select: { avatar: true },
      });

      this.socketService.broadcastToRoom(tournamentId, "tournament:finish", {
        tournamentId,
        message: `${winnerParticipant.username} has won the tournament with ${maxWins} victories!`,
        winner: {
          id: winnerParticipant.userId,
          username: winnerParticipant.username,
          avatar: userAvatar?.avatar || "",
          totalWins: maxWins,
        },
        matches: matches,
      });
    }
    // TODO: store matchs on blockchain
    //call blockchain service, format data and store it
    /* matchId          
  tournamentId Int
  
  player1Id    Int
  player2Id    Int
  
  player1Score Int        
  player2Score Int        

  this.matchService.getTournamentMatches(tournamentId)
  
  this.blockchainService.storeMatch(matchDataFormatted)
  */
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

    // Créer le jeu s'il n'existe pas déjà
    if (!this.gameService.getGameState()) {
      this.gameService.createGame(
        data.matchId,
        match.player1Id,
        match.player2Id
      );
    }

    const bothPlayersReady = this.matchService.setPlayerReady(
      data.matchId,
      client.userId,
      match.player1Id,
      match.player2Id
    );

    const readyState = this.matchService.getReadyState(data.matchId);
    if (!readyState) return;

    this.socketService.broadcastToRoom(data.tournamentId, "match:ready", {
      matchId: data.matchId,
      player1Ready: readyState.player1Ready,
      player2Ready: readyState.player2Ready,
    });

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
    if (!client || !this.socketService.isInRoom(socket, data.tournamentId))
      return;

    this.gameService.movePaddle(client.userId, data.position);
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
      const gameState = this.gameService.getGameState();

      if (!gameState) {
        socket.send(
          JSON.stringify({
            event: "error",
            data: { message: "Game state not found for this match" },
          })
        );
        return;
      }

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

    const gameLoop = setInterval(() => {
      const gameState = this.gameService.getGameState();
      if (!gameState) {
        clearInterval(this.gameLoops.get(matchId));
        this.gameLoops.delete(matchId);
        return;
      }

      const scoreChanged = this.gameService.updateBall();

      this.socketService.broadcastToRoom(tournamentId, "match:update", {
        matchId,
        state: gameState,
      });

      if (scoreChanged && this.gameService.isGameOver()) {
        clearInterval(this.gameLoops.get(matchId));
        this.gameLoops.delete(matchId);
        this.endMatch(tournamentId, matchId);
      }
    }, 1000 / 30);

    this.gameLoops.set(matchId, gameLoop);
  }

  private async endMatch(tournamentId: number, matchId: number): Promise<void> {
    const gameState = this.gameService.getGameState();
    if (!gameState) return;

    const winnerId =
      gameState.scores.player1 >= 5
        ? this.gameService.getPlayerId(1)
        : this.gameService.getPlayerId(2);
    if (!winnerId) return;

    const finalScores = {
      player1: gameState.scores.player1,
      player2: gameState.scores.player2,
    };

    this.matchService.resetReadyState(matchId);
    this.gameService.reset();

    try {
      const result = await this.matchService.finishMatch(
        matchId,
        winnerId,
        finalScores.player1,
        finalScores.player2
      );

      const nextMatch = await this.matchService.startNextMatch(
        result.tournamentId
      );

      const freshMatches = await this.matchService.getTournamentMatches(
        tournamentId
      );
      console.log("freshMatches", freshMatches);

      this.socketService.broadcastToRoom(tournamentId, "match:end", {
        matchId,
        winnerId,
        player1Score: finalScores.player1,
        player2Score: finalScores.player2,
        matches: freshMatches,
      });

      if (!nextMatch) {
        await this.handleTournamentFinish(tournamentId);
      }
    } catch (error) {
      console.error("Error ending match:", error);
    }
  }
}
