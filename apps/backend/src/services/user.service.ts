import { FastifyInstance } from "fastify";
import { UserProfile, UserPublicProfile } from "#types/user.type";

export class UserService {
  constructor(private readonly app: FastifyInstance) {}

  async getMe(userId: number): Promise<UserProfile> {
    try {
      const user = await this.app.db.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user as UserProfile;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  async getUserById(userId: number): Promise<UserPublicProfile> {
    try {
      const user = await this.app.db.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user as UserPublicProfile;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw error;
    }
  }

  async updateUserProfile(
    userId: number,
    data: Partial<UserProfile>
  ): Promise<UserProfile> {
    try {
      const user = await this.app.db.user.update({
        where: {
          id: userId,
        },
        data: {
          username: data.username,
          email: data.email,
          avatar: data.avatar,
        },
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
        },
      });

      return user as UserProfile;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  async getUserMatchHistory(userId: number) {
    try {
      const matches = await this.app.db.match.findMany({
        where: {
          OR: [{ player1Id: userId }, { player2Id: userId }],
        },
        select: {
          id: true,
          player1Id: true,
          player2Id: true,
          player1Score: true,
          player2Score: true,
          winnerId: true,
          status: true,
          createdAt: true,
          player1: {
            select: {
              username: true,
              avatar: true,
            },
          },
          player2: {
            select: {
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Calculate statistics
      const totalMatches = matches.length;
      const wonMatches = matches.filter(
        (match) => match.winnerId === userId
      ).length;
      const winRate = totalMatches > 0 ? (wonMatches / totalMatches) * 100 : 0;

      // Format matches for display
      const formattedMatches = matches.map((match) => {
        const isPlayer1 = match.player1Id === userId;
        const userScore = isPlayer1 ? match.player1Score : match.player2Score;
        const opponentScore = isPlayer1
          ? match.player2Score
          : match.player1Score;
        const opponentName = isPlayer1
          ? match.player2.username
          : match.player1.username;
        const opponentAvatar = isPlayer1
          ? match.player2.avatar
          : match.player1.avatar;
        const won = match.winnerId === userId;

        return {
          id: match.id,
          opponentName,
          opponentAvatar,
          userScore,
          opponentScore,
          won,
          status: match.status,
          date: match.createdAt,
        };
      });

      return {
        matches: formattedMatches,
        stats: {
          totalMatches,
          wonMatches,
          winRate: winRate.toFixed(2),
        },
      };
    } catch (error) {
      console.error("Error fetching user match history:", error);
      throw error;
    }
  }
}
