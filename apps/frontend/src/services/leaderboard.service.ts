import { LeaderboardServiceInterface } from "../lib/types";
import { apiURL } from "../lib/constant";

class LeaderboardService implements LeaderboardServiceInterface {
  leaderboardURL = `${apiURL}/leaderboard`;

  async getLeaderboard() {
    const response = await fetch(this.leaderboardURL);

    if (!response.ok) {
      throw new Error("Failed to get leaderboard");
    }

    return response.json();
  }

  async getUserProfile(userId: string) {
    const response = await fetch(`${this.leaderboardURL}/${userId}`);

    if (!response.ok) {
      throw new Error("Failed to get user profile");
    }

    return response.json();
  }
}

const leaderboardService = new LeaderboardService();
export default leaderboardService;

