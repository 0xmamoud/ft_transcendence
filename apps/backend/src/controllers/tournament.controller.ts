import { TournamentService } from "#services/tournament.service";
import { FastifyRequest, FastifyReply } from "fastify";

interface CreateTournamentQuery {
  maxParticipants?: number;
}

export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  async getTournaments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tournaments = await this.tournamentService.getTournaments();
      return reply.status(200).send(tournaments);
    } catch (error) {
      return reply.status(500).send({ message: (error as Error).message });
    }
  }

  async getTournament(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const tournament = await this.tournamentService.getTournament(Number(id));
      return reply.status(200).send(tournament);
    } catch (error) {
      return reply.status(500).send({ message: (error as Error).message });
    }
  }

  async createTournament(
    request: FastifyRequest<{
      Body: { name: string };
      Querystring: CreateTournamentQuery;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { name } = request.body;
      const { maxParticipants } = request.query;
      const username = request.user.username ?? `User_${request.user.userId}`;

      const tournament = await this.tournamentService.createTournament(
        name,
        request.user.userId,
        username,
        maxParticipants
      );
      return reply.status(200).send(tournament);
    } catch (error) {
      return reply.status(500).send({ message: (error as Error).message });
    }
  }

  async joinTournament(
    request: FastifyRequest<{
      Params: { id: string };
      Body: { username?: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const username =
        request.body.username ??
        request.user.username ??
        `User_${request.user.userId}`;

      const tournament = await this.tournamentService.joinTournament(
        Number(id),
        request.user.userId,
        username
      );
      return reply.status(200).send(tournament);
    } catch (error) {
      return reply.status(500).send({ message: (error as Error).message });
    }
  }

  async startTournament(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const tournament = await this.tournamentService.startTournament(
        Number(id),
        request.user.userId
      );
      return reply.status(200).send(tournament);
    } catch (error) {
      return reply.status(500).send({ message: (error as Error).message });
    }
  }

  async getTournamentParticipants(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const participants =
        await this.tournamentService.getTournamentParticipants(Number(id));
      return reply.status(200).send(participants);
    } catch (error) {
      return reply.status(500).send({ message: (error as Error).message });
    }
  }
}
