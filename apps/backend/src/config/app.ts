import Fastify from "fastify";
import fastifyEnv from "@fastify/env";
import WebSocket from "@fastify/websocket";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";

// Configs
import { envConfig } from "#config/env";
import db from "#config/db";
import { passwordPlugin, tokenPlugin } from "#config/auth";
import cookieConfig from "#config/cookie";
import corsConfig from "#config/cors";

// Logger
const app = Fastify({
  logger: true,
});

// Async function to initialize the application
const initialize = async () => {
  // Environment variables setup
  await app.register(fastifyEnv, envConfig);

  // Cors setup
  await app.register(cors, corsConfig);

  // JWT setup
  await app.register(jwt, {
    secret: app.envs.APP_KEY,
  });

  // Auth plugins setup
  await app.register(passwordPlugin);
  await app.register(tokenPlugin);

  // Cookie setup
  await app.register(cookie, {
    ...cookieConfig,
    secret: app.envs.APP_KEY,
  });

  // Prisma setup
  await app.register(db);

  // WebSocket setup
  await app.register(WebSocket);
};

// Initialize the application
initialize().catch((err) => {
  app.log.error(err);
  process.exit(1);
});

export default app;
