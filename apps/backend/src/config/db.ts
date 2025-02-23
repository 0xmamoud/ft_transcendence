import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { PrismaClient } from "@prisma/client";

declare module "fastify" {
  interface FastifyInstance {
    db: PrismaClient;
  }
}

const dbPlugin: FastifyPluginAsync = fp(async (fastify, options) => {
  const db = new PrismaClient();
  await db.$connect();

  fastify.decorate("db", db);

  fastify.addHook("onClose", async (fastify) => {
    await fastify.db.$disconnect();
  });
});

export default dbPlugin;
