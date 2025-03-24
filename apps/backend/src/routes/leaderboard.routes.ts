import { FastifyInstance } from "fastify";
import { LeaderboardController } from "#controllers/leaderboard.controller";
import { LeaderboardService } from "#services/leaderboard.service";

export default async function leaderboardRoutes(app: FastifyInstance) {
  const leaderboardService = new LeaderboardService(app);
  const leaderboardController = new LeaderboardController(leaderboardService);

  app.addHook("onRequest", app.authenticate);

  app.get("/", leaderboardController.getLeaderboard);

  app.get("/user/:id", leaderboardController.getUserStats);
}
