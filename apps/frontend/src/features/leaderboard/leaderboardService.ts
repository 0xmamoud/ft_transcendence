import { LeaderboardEntry, UserStats } from "./types";

export class LeaderboardService {
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const response = await fetch("/api/leaderboard", {
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch leaderboard");
    }

    return data as LeaderboardEntry[];
  }

  async getUserStats(userId: number): Promise<UserStats> {
    const response = await fetch(`/api/leaderboard/user/${userId}`, {
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch user stats");
    }

    return data as UserStats;
  }
}

export const leaderboardService = new LeaderboardService();
