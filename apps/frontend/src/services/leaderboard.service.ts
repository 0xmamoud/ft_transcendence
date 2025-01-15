import { LeaderboardServiceInterface } from "../lib/types";
import { apiURL } from "../lib/constant";

class LeaderboardService implements LeaderboardServiceInterface {
  leaderboardURL = `${apiURL}/leaderboard`;

  async getLeaderboard() {
    try {
      const response = await fetch(this.leaderboardURL);

      if (!response.ok) {
        throw new Error("Failed to get leaderboard");
      }

      return response.json();
    } catch (error) {
      console.error(error);
    }
  }

  async getUserProfile(userId: string) {
    try {
      const response = await fetch(`${this.leaderboardURL}/${userId}`);

      if (!response.ok) {
        throw new Error("Failed to get user profile");
      }

      return response.json();
    } catch (error) {
      console.error(error);
    }
  }
}

const leaderboardService = new LeaderboardService();
export default leaderboardService;

