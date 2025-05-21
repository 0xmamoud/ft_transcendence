import { FastifyInstance } from "fastify";

import controler from "#controllers/avalanche_controler"

export default async function storageRoute(app: FastifyInstance) {
  app.post("/newHistory", controler.storeScore);
  app.get("/getHistory", controler.getGlobalHistory);
  app.get("/getPlayerHistory/:userId", controler.getGlobalHistory);
  app.get("/askToBlockchainStorage", controler.askToBlockchainStorage);
}
