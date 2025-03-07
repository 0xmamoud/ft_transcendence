import { FastifyInstance } from "fastify";

export class MatchService {
  constructor(private readonly app: FastifyInstance) {}

  /**
   * Crée les matchs pour un tournoi
   */
  async createMatches(tournamentId: number) {
    // Récupérer les participants du tournoi
    const tournament = await this.app.db.tournament.findUnique({
      where: { id: tournamentId },
      include: { participants: true },
    });

    if (!tournament) {
      throw new Error("Tournament not found");
    }

    const participants = tournament.participants;
    const matches = [];

    // Créer un match pour chaque paire de participants
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const match = await this.app.db.match.create({
          data: {
            tournamentId: tournamentId,
            player1Id: participants[i].userId,
            player2Id: participants[j].userId,
            status: "PENDING",
          },
        });
        matches.push(match);
      }
    }

    return matches;
  }

  /**
   * Démarre le prochain match d'un tournoi
   */
  async startNextMatch(tournamentId: number) {
    const nextMatch = await this.app.db.match.findFirst({
      where: {
        tournamentId,
        status: "PENDING",
      },
      orderBy: {
        id: "asc",
      },
    });

    if (!nextMatch) {
      return null;
    }

    return await this.app.db.match.update({
      where: { id: nextMatch.id },
      data: { status: "IN_PROGRESS" },
    });
  }

  /**
   * Récupère les matchs d'un tournoi
   */
  async getTournamentMatches(tournamentId: number) {
    return await this.app.db.match.findMany({
      where: { tournamentId },
      include: {
        player1: {
          select: {
            id: true,
            username: true,
          },
        },
        player2: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  /**
   * Récupère un match par son ID
   */
  async getMatch(matchId: number) {
    return await this.app.db.match.findUnique({
      where: { id: matchId },
      include: {
        player1: {
          select: {
            id: true,
            username: true,
          },
        },
        player2: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  /**
   * Met à jour les scores d'un match
   */
  async updateMatchScores(
    matchId: number,
    player1Score: number,
    player2Score: number
  ) {
    try {
      return await this.app.db.match.update({
        where: { id: matchId },
        data: {
          player1Score,
          player2Score,
        },
      });
    } catch (error) {
      console.error(`Error updating match scores for match ${matchId}:`, error);
      throw error;
    }
  }

  /**
   * Termine un match
   */
  async finishMatch(
    matchId: number,
    winnerId: number,
    player1Score?: number,
    player2Score?: number
  ) {
    // Mettre à jour le match actuel
    const currentMatch = await this.app.db.match.update({
      where: { id: matchId },
      data: {
        status: "COMPLETED",
        winnerId: winnerId,
        ...(player1Score !== undefined ? { player1Score } : {}),
        ...(player2Score !== undefined ? { player2Score } : {}),
      },
    });

    return {
      match: currentMatch,
      tournamentId: currentMatch.tournamentId,
    };
  }

  /**
   * Vérifie si tous les matchs d'un tournoi sont terminés
   */
  async areAllMatchesCompleted(tournamentId: number) {
    const matches = await this.app.db.match.findMany({
      where: { tournamentId },
    });

    return (
      matches.length > 0 &&
      matches.every((match) => match.status === "COMPLETED")
    );
  }
}
