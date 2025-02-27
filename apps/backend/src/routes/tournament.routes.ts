import { FastifyInstance } from "fastify";
import { TournamentController } from "#controllers/tournament.controller";
import { TournamentService } from "#services/tournament.service";

async function tournamentRoutes(app: FastifyInstance) {
  const tournamentService = new TournamentService(app);
  const tournamentController = new TournamentController(tournamentService);

  app.addHook("onRequest", app.authenticate);

  app.get("/", tournamentController.getTournaments);

  app.post(
    "/create",
    {
      schema: {
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              minLength: 3,
              maxLength: 30,
            },
          },
        },
      },
    },
    tournamentController.createTournament
  );

  app.get("/:id", tournamentController.getTournament);

  app.post("/join/:id", tournamentController.joinTournament);

  app.post("/start/:id", tournamentController.startTournament);
}

export default tournamentRoutes;
