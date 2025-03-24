import { FastifyReply, FastifyRequest } from "fastify";
import { LeaderboardService } from "#services/leaderboard.service";

export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  getLeaderboard = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const leaderboard = await this.leaderboardService.getLeaderboard();
      return reply.send(leaderboard);
    } catch (error) {
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  };

  getUserStats = async (
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply
  ) => {
    try {
      const userId = parseInt(request.params.id, 10);
      if (isNaN(userId)) {
        return reply.status(400).send({ error: "Invalid user ID" });
      }

      const stats = await this.leaderboardService.getUserStats(userId);
      if (!stats) {
        return reply.status(404).send({ error: "User not found" });
      }
      return reply.send(stats);
    } catch (error) {
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  };
}
