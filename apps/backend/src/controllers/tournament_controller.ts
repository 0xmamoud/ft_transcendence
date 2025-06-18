import { TournamentService } from "#services/tournament_service";
import { FastifyRequest, FastifyReply } from "fastify";

interface CreateTournamentQuery {
  maxParticipants?: number;
}

export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  async getTournaments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tournaments = await this.tournamentService.getTournaments();
      if (!tournaments) {
        return reply.status(404).send({ message: "Tournaments not found" });
      }

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
      Body: { name: string; username?: string };
      Querystring: CreateTournamentQuery;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { name } = request.body;
      const { maxParticipants } = request.query;

      const username = request.body.username ?? request.user.username;

      const tournament = await this.tournamentService.createTournament(
        name,
        request.user.userId,
        username,
        maxParticipants
      );
      if (!tournament) {
        return reply.status(404).send({ message: "Tournament not found" });
      }
      return reply.status(200).send(tournament);
    } catch (error) {
      return reply.status(401).send({ message: "Tournament already exist" });
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
      const username = request.body.username ?? request.user.username;
      if (!id || isNaN(Number(id))) {
        return reply.status(400).send({ message: "Invalid tournament ID" });
      }

      const tournament = await this.tournamentService.joinTournament(
        Number(id),
        request.user.userId,
        username
      );
      if (!tournament) {
        return reply.status(404).send({ message: "Tournament not found" });
      }
      return reply.status(200).send(tournament);
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
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
      if (!tournament) {
        return reply.status(404).send({ message: "Tournament not found" });
      }
      return reply.status(200).send(tournament);
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
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
      if (!participants) {
        return reply.status(404).send({ message: "Participants not found" });
      }
      return reply.status(200).send(participants);
    } catch (error) {
      return reply.status(500).send({ message: (error as Error).message });
    }
  }
}
