import { FastifyInstance } from "fastify";

interface ReadyState {
  player1Ready: boolean;
  player2Ready: boolean;
}

export class MatchService {
  private readyStates: Map<number, ReadyState>;

  constructor(private readonly app: FastifyInstance) {
    this.readyStates = new Map();
  }

  async createMatches(tournamentId: number) {
    const tournament = await this.app.db.tournament.findUnique({
      where: { id: tournamentId },
      include: { participants: true },
    });

    if (!tournament) {
      throw new Error("Tournament not found");
    }

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

  async finishMatch(
    matchId: number,
    winnerId: number,
    player1Score?: number,
    player2Score?: number
  ) {
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

  async areAllMatchesCompleted(tournamentId: number) {
    const matches = await this.app.db.match.findMany({
      where: { tournamentId },
    });

    return (
      matches.length > 0 &&
      matches.every((match) => match.status === "COMPLETED")
    );
  }

  initializeReadyState(matchId: number): void {
    this.readyStates.set(matchId, {
      player1Ready: false,
      player2Ready: false,
    });
  }

  setPlayerReady(
    matchId: number,
    playerId: number,
    player1Id: number,
    player2Id: number
  ): boolean {
    const readyState = this.readyStates.get(matchId);
    if (!readyState) {
      this.initializeReadyState(matchId);
      return this.setPlayerReady(matchId, playerId, player1Id, player2Id);
    }

    if (playerId === player1Id) {
      readyState.player1Ready = true;
    } else if (playerId === player2Id) {
      readyState.player2Ready = true;
    }

    return readyState.player1Ready && readyState.player2Ready;
  }

  getReadyState(matchId: number): ReadyState | undefined {
    return this.readyStates.get(matchId);
  }

  resetReadyState(matchId: number): void {
    this.readyStates.delete(matchId);
  }
}
