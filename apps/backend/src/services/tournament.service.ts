import { FastifyInstance } from "fastify";

export class TournamentService {
  constructor(private readonly app: FastifyInstance) {}

  async createTournament(
    tournamentName: string,
    creatorId: number,
    username?: string,
    maxParticipants?: number
  ) {
    if (!username) {
      const user = await this.app.db.user.findUnique({
        where: { id: creatorId },
      });
      username = user?.username;
    }

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

  async joinTournament(
    tournamentId: number,
    userId: number,
    username?: string
  ) {
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

    if (!username) {
      const user = await this.app.db.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new Error("User not found");
      }
      username = user.username;
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

    const participants = tournament.participants;
    const matches = [];

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

  async finishTournament(tournamentId: number) {
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
      data: { status: "COMPLETED" },
    });
  }

  async getTournaments() {
    return await this.app.db.tournament.findMany({
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
  }

  async getTournament(tournamentId: number) {
    return await this.app.db.tournament.findUnique({
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
  }
}
