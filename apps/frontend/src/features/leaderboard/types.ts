export interface LeaderboardEntry {
  id: number;
  username: string;
  totalMatches: number;
  wins: number;
  winRate: number;
}

export interface UserStats {
  id: number;
  username: string;
  stats: {
    totalMatches: number;
    wins: number;
    losses: number;
    winRate: number;
    lossRate: number;
  };
  matchHistory: {
    matchId: number;
    opponent: {
      id: number;
      username: string;
    };
    won: boolean;
  }[];
}
