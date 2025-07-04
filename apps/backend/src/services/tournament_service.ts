import { FastifyInstance } from "fastify";
import { MatchService } from "#services/match_service";

export class TournamentService {
  constructor(
    private readonly app: FastifyInstance,
    private readonly matchService: MatchService
  ) {}

  async createTournament(
    tournamentName: string,
    creatorId: number,
    username: string,
    maxParticipants?: number
  ) {
    const tournament = await this.app.db.tournament.create({
      data: {
        name: tournamentName,
        creatorId,
        maxParticipants,
      },
    });

    await this.app.db.participant.create({
      data: {
        userId: creatorId,
        tournamentId: tournament.id,
        username: username,
      },
    });

    return tournament;
  }

  async joinTournament(tournamentId: number, userId: number, username: string) {
    const tournament = await this.app.db.tournament.findUnique({
      where: { id: tournamentId },
      include: { participants: true },
    });

    if (!tournament) {
      throw new Error("Tournament not found");
    }

    if (tournament.status !== "PENDING") {
      throw new Error("Tournament is not accepting participants");
    }

    if (
      tournament.maxParticipants &&
      tournament.participants.length >= tournament.maxParticipants
    ) {
      throw new Error("Tournament is full");
    }

    const existingUsername = await this.app.db.participant.findFirst({
      where: {
        tournamentId,
        username,
      },
    });

    if (existingUsername) {
      throw new Error("Username is already taken in this tournament");
    }

    const existingParticipant = await this.app.db.participant.findUnique({
      where: {
        userId_tournamentId: {
          userId: userId,
          tournamentId: tournamentId,
        },
      },
    });

    if (existingParticipant) {
      throw new Error("User already in tournament");
    }

    return await this.app.db.participant.create({
      data: {
        userId: userId,
        tournamentId: tournamentId,
        username: username,
      },
    });
  }

  async startTournament(tournamentId: number, userId: number) {
    const tournament = await this.app.db.tournament.findUnique({
      where: { id: tournamentId },
      include: { participants: true },
    });

    if (!tournament) {
      throw new Error("Tournament not found");
    }

    if (tournament.creatorId !== userId) {
      throw new Error("User is not the creator of the tournament");
    }

    if (tournament.status !== "PENDING") {
      throw new Error("Tournament is not pending");
    }

    const minParticipants = 2;
    if (tournament.participants.length < minParticipants) {
      throw new Error("Not enough participants to start the tournament");
    }

    await this.app.db.tournament.update({
      where: { id: tournamentId },
      data: { status: "IN_PROGRESS" },
    });

    return tournament;
  }

  async finishTournament(tournamentId: number, winnerId: number) {
    const tournament = await this.app.db.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new Error("Tournament not found");
    }

    if (tournament.status !== "IN_PROGRESS") {
      throw new Error("Tournament is not in progress");
    }

    return await this.app.db.tournament.update({
      where: { id: tournamentId },
      data: { status: "COMPLETED", winnerId },
    });
  }

  async getTournaments() {
    try {
      const tournaments = await this.app.db.tournament.findMany({
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
          matches: {
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
          },
        },
      });
      return tournaments;
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      return null;
    }
  }

  async getTournament(tournamentId: number) {
    try {
      const tournament = await this.app.db.tournament.findUnique({
        where: { id: tournamentId },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
          matches: {
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
          },
        },
      });
      if (!tournament) {
        return null;
      }
      return tournament;
    } catch (error) {
      console.error("Error fetching tournament:", error);
      return null;
    }
  }

  async getTournamentParticipants(tournamentId: number) {
    const tournament = await this.app.db.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!tournament) {
      return null;
    }

    return tournament.participants;
  }
}
