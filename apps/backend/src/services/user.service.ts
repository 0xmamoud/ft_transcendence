import { FastifyInstance } from "fastify";
import { UserProfile, UserPublicProfile } from "#types/user.type";
import Avalanche from "#services/blockchain_service";

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
      const user = await this.app.db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userHistory = await Avalanche.getUserMatchHistory(userId);

      // Si pas d'historique sur la blockchain, retourner un objet vide
      if (!userHistory || userHistory.length === 0) {
        return {
          userId: user.id,
          username: user.username,
          matches: [],
          stats: {
            totalMatches: 0,
            wonMatches: 0,
            winRate: "0.00",
          },
        };
      }

      // Récupérer tous les IDs des opponents uniques
      const opponentIds = Array.from(
        new Set(
          userHistory.map((match) =>
            match.player1_id === userId ? match.player2_id : match.player1_id
          )
        )
      );

      // Récupérer les informations des opponents depuis la base de données
      const opponents = await this.app.db.user.findMany({
        where: {
          id: { in: opponentIds },
        },
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      });

      // Créer un map pour un accès rapide aux informations des opponents
      const opponentMap = new Map(
        opponents.map((opponent) => [opponent.id, opponent])
      );

      // Calculate statistics
      const totalMatches = userHistory.length;
      const wonMatches = userHistory.filter((match) => {
        if (match.player1_id === userId) {
          return match.player1_score > match.player2_score;
        } else {
          return match.player2_score > match.player1_score;
        }
      }).length;
      const winRate = totalMatches > 0 ? (wonMatches / totalMatches) * 100 : 0;

      // Format matches for display using userHistory data
      const formattedMatches = userHistory.map((match) => {
        const isPlayer1 = match.player1_id === userId;
        const userScore = isPlayer1 ? match.player1_score : match.player2_score;
        const opponentScore = isPlayer1
          ? match.player2_score
          : match.player1_score;
        const opponentId = isPlayer1 ? match.player2_id : match.player1_id;
        const opponent = opponentMap.get(opponentId);
        const won = isPlayer1
          ? match.player1_score > match.player2_score
          : match.player2_score > match.player1_score;

        return {
          id: match.matchId,
          opponentId: opponentId,
          opponentName: opponent?.username || "Unknown",
          opponentAvatar: opponent?.avatar || null,
          userScore,
          opponentScore,
          won,
          status: "COMPLETED",
          date: match.date,
        };
      });

      return {
        userId: user.id,
        username: user.username,
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
