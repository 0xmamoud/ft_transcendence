import { FastifyInstance } from "fastify";

async function tournamentRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticate);

  app.get("/", async (request, reply) => {
    console.log("get tournaments");
  });

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
    async (request, reply) => {
      console.log("create tournament");
    }
  );

  app.get("/:id", async (request, reply) => {
    console.log("get tournament");
  });

  app.post("/join/:id", async (request, reply) => {
    console.log("join tournament");
  });

  app.post("/start/:id", async (request, reply) => {
    console.log("start tournament");
  });

  app.post("/finish/:id", async (request, reply) => {
    console.log("finish tournament");
  });
}

export default tournamentRoutes;
