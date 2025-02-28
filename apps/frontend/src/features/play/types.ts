interface User {
  id: number;
  username: string;
}

interface Participant {
  userId: number;
  tournamentId: number;
  username: string;
  user: User;
}

interface Match {
  id: number;
  tournamentId: number;
  player1Id: number;
  player2Id: number;
  player1Score?: number;
  player2Score?: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  player1: User;
  player2: User;
}

interface Tournament {
  id: number;
  name: string;
  creatorId: number;
  maxParticipants?: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  participants: Participant[];
  matches: Match[];
}

export interface CreateTournamentDto {
  name: string;
  creatorUsername?: string;
  maxParticipants?: number;
}

export interface JoinTournamentDto {
  username?: string;
}

export interface ITournamentService {
  createTournament(data: CreateTournamentDto): Promise<Tournament>;
  joinTournament(id: number, data?: JoinTournamentDto): Promise<Participant>;
  startTournament(id: number): Promise<Match[]>;
}
