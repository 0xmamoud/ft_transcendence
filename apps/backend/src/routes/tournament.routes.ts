import { FastifyInstance } from "fastify";
import { TournamentController } from "#controllers/tournament.controller";
import { TournamentService } from "#services/tournament.service";

async function tournamentRoutes(app: FastifyInstance) {
  const tournamentService = new TournamentService(app);
  const tournamentController = new TournamentController(tournamentService);

  app.addHook("onRequest", app.authenticate);

  app.get("/", tournamentController.getTournaments.bind(tournamentController));

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
        querystring: {
          type: "object",
          properties: {
            maxParticipants: { type: "number", minimum: 2 },
          },
        },
      },
    },
    tournamentController.createTournament.bind(tournamentController)
  );

  app.get(
    "/:id",
    tournamentController.getTournament.bind(tournamentController)
  );

  app.post(
    "/join/:id",
    tournamentController.joinTournament.bind(tournamentController)
  );

  app.post(
    "/start/:id",
    tournamentController.startTournament.bind(tournamentController)
  );
}

export default tournamentRoutes;
