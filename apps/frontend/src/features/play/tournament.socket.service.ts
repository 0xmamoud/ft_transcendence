import { SocketService } from "@/features/shared/socket.service";

export interface TournamentSocketEvent {
  event: string;
  data: any;
}

export class TournamentSocketService extends SocketService {
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
}
