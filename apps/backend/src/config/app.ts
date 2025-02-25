import Fastify from "fastify";
import fastifyEnv from "@fastify/env";
import WebSocket from "@fastify/websocket";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";

// Configs
import { envConfig } from "#config/env";
import db from "#config/db";
import { tokenPlugin, hashPlugin } from "#config/auth";
import { createCookieConfig } from "#config/cookie";
import corsConfig from "#config/cors";

// Create Fastify instance
const app = Fastify({
  logger: false,
});

export async function configureApp() {
  // Environment variables setup
  await app.register(fastifyEnv, envConfig);

  // Multipart setup
  await app.register(multipart, {
    attachFieldsToBody: "keyValues",
  });

  // Cors setup
  await app.register(cors, corsConfig);

  // JWT setup
  await app.register(jwt, {
    secret: app.envs.APP_KEY,
    sign: {
      algorithm: "HS256",
    },
  });

  // Auth plugins setup
  await app.register(hashPlugin);
  await app.register(tokenPlugin);

  // Cookie setup
  const cookieConfig = createCookieConfig(app.envs);
  await app.register(cookie, {
    ...cookieConfig,
    secret: app.envs.APP_KEY,
  });

  // Prisma setup
  await app.register(db);

  // WebSocket setup
  await app.register(WebSocket);
  // console.log(app.envs);

  return app;
}

// Export the unconfigured app instance
export default app;
