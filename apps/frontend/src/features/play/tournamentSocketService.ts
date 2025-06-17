import { SocketService } from "@/features/shared/socketService";
import { GameState } from "./gameService";

export interface TournamentSocketEvent {
  event: string;
  data: any;
}

class TournamentSocketService extends SocketService {
  private isInitialized: boolean = false;
  constructor() {
    super("ws");
  }

  public async initialize(): Promise<void> {
    if (!this.isInitialized) {
      await this.connect();
      this.isInitialized = true;
    }
  }

  joinTournament(tournamentId: number): void {
    this.emit("tournament:join", { tournamentId });
  }

  leaveTournament(tournamentId: number): void {
    this.emit("tournament:leave", { tournamentId });
  }

  startTournament(tournamentId: number): void {
    this.emit("tournament:start", { tournamentId });
  }

  finishTournament(tournamentId: number): void {
    this.emit("tournament:finish", { tournamentId });
  }

  sendChatMessage(tournamentId: number, message: string): void {
    this.emit("tournament:chat", { tournamentId, message });
  }

  sendPaddleMove(
    tournamentId: number,
    matchId: number,
    position: number
  ): void {
    this.emit("match:move", {
      tournamentId,
      matchId,
      position,
    });
  }

  sendPlayerReady(tournamentId: number, matchId: number): void {
    this.emit("match:ready", {
      tournamentId,
      matchId,
    });
  }

  getGameState(tournamentId: number, matchId: number): void {
    this.emit("match:getState", {
      tournamentId,
      matchId,
    });
  }

  onGameUpdate(callback: (state: GameState) => void): void {
    this.on("match:update", callback);
  }

  onScore(
    callback: (data: { player1Score: number; player2Score: number }) => void
  ): void {
    this.on("match:score", callback);
  }

  onMatchStart(callback: () => void): void {
    this.on("match:start", callback);
  }

  onMatchEnd(callback: (data: { winnerId: number }) => void): void {
    this.on("match:end", callback);
  }
}

export const tournamentSocket = new TournamentSocketService();
