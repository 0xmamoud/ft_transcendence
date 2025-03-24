import { FastifyInstance } from "fastify";

export class LeaderboardService {
  constructor(private readonly app: FastifyInstance) {}

  async getLeaderboard() {
    const users = await this.app.db.user.findMany({
      select: {
        id: true,
        username: true,
        matchesAsPlayer1: {
          select: {
            winnerId: true,
            player1Id: true,
          },
        },
        matchesAsPlayer2: {
          select: {
            winnerId: true,
            player2Id: true,
          },
        },
      },
    });

    return users
      .map((user) => {
        const matchesAsPlayer1 = user.matchesAsPlayer1;
        const matchesAsPlayer2 = user.matchesAsPlayer2;
        const totalMatches = matchesAsPlayer1.length + matchesAsPlayer2.length;

        const winsAsPlayer1 = matchesAsPlayer1.filter(
          (match) => match.winnerId === user.id
        ).length;
        const winsAsPlayer2 = matchesAsPlayer2.filter(
          (match) => match.winnerId === user.id
        ).length;
        const totalWins = winsAsPlayer1 + winsAsPlayer2;

        const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;

        return {
          id: user.id,
          username: user.username,
          totalMatches,
          wins: totalWins,
          winRate: Math.round(winRate * 100) / 100,
        };
      })
      .sort((a, b) => b.winRate - a.winRate);
  }

  async getUserStats(userId: number) {
    const user = await this.app.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        matchesAsPlayer1: {
          select: {
            id: true,
            winnerId: true,
            player1Id: true,
            player2: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        matchesAsPlayer2: {
          select: {
            id: true,
            winnerId: true,
            player2Id: true,
            player1: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!user) return null;

    const matchesAsPlayer1 = user.matchesAsPlayer1;
    const matchesAsPlayer2 = user.matchesAsPlayer2;
    const totalMatches = matchesAsPlayer1.length + matchesAsPlayer2.length;

    const winsAsPlayer1 = matchesAsPlayer1.filter(
      (match) => match.winnerId === user.id
    ).length;
    const winsAsPlayer2 = matchesAsPlayer2.filter(
      (match) => match.winnerId === user.id
    ).length;
    const totalWins = winsAsPlayer1 + winsAsPlayer2;

    const losses = totalMatches - totalWins;
    const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;
    const lossRate = totalMatches > 0 ? (losses / totalMatches) * 100 : 0;

    const matchHistory = [
      ...matchesAsPlayer1.map((match) => ({
        matchId: match.id,
        opponent: {
          id: match.player2.id,
          username: match.player2.username,
        },
        won: match.winnerId === user.id,
      })),
      ...matchesAsPlayer2.map((match) => ({
        matchId: match.id,
        opponent: {
          id: match.player1.id,
          username: match.player1.username,
        },
        won: match.winnerId === user.id,
      })),
    ];

    return {
      id: user.id,
      username: user.username,
      stats: {
        totalMatches,
        wins: totalWins,
        losses,
        winRate: Math.round(winRate * 100) / 100,
        lossRate: Math.round(lossRate * 100) / 100,
      },
      matchHistory,
    };
  }
}
