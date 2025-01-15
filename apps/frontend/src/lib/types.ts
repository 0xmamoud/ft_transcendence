export interface UserServiceInterface {
  loginURL: string;
  signupURL: string;
  oauthURL: string;
  profileURL: string;

  login(email: string, password: string): Promise<void>;
  signup(email: string, password: string): Promise<void>;
  oauth(): Promise<void>;
  getUserProfile(): Promise<{
    avatar: string;
    username: string;
    email: string;
    history: GameHistory[];
  }>;
  logout(): Promise<void>;
  getSession(): Promise<{
    userId: string;
    username: string;
  }>;
}

export interface GameHistory {
  id: number;
  winnerId: number;
  loserId: number;
  score: string;
  date: Date;
  winner: string;
  loser: string;
}

export interface LeaderboardServiceInterface {
  leaderboardURL: string;

  getLeaderboard(): Promise<{
    userId: string;
    username: string;
    totalGames: number;
    wins: number;
  }>;
  getUserProfile(): Promise<GameHistory[]>;
}

export interface GameServiceInterface {

}
