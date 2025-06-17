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
    // Récupérer les matches avec les informations de base
    const matches = await this.app.db.match.findMany({
      where: { tournamentId },
      select: {
        id: true,
        status: true,
        player1Id: true,
        player2Id: true,
        player1Score: true,
        player2Score: true,
        winnerId: true,
        player1: {
          select: {
            id: true,
            avatar: true,
          },
        },
        player2: {
          select: {
            id: true,
            avatar: true,
          },
        },
      },
    });

    // Récupérer tous les participants du tournoi avec leurs usernames
    const participants = await this.app.db.participant.findMany({
      where: { tournamentId },
      select: {
        userId: true,
        username: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    // Créer un map pour accès rapide aux usernames des participants
    const participantMap = new Map(
      participants.map((participant) => [
        participant.userId,
        participant.username || participant.user.username, // Utilise le username du participant ou celui du user par défaut
      ])
    );

    // Formatter les matches avec les usernames des participants
    return matches.map((match) => ({
      id: match.id,
      status: match.status,
      player1Id: match.player1Id,
      player2Id: match.player2Id,
      player1Score: match.player1Score,
      player2Score: match.player2Score,
      winnerId: match.winnerId,
      player1: {
        id: match.player1.id,
        username: participantMap.get(match.player1Id) || "Unknown",
        avatar: match.player1.avatar,
      },
      player2: {
        id: match.player2.id,
        username: participantMap.get(match.player2Id) || "Unknown",
        avatar: match.player2.avatar,
      },
    }));
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
