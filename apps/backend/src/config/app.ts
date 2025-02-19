import Fastify from "fastify";
import fastifyEnv from "@fastify/env";
import WebSocket from "@fastify/websocket";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";

// Configs
import { envConfig } from "#config/env";
import prisma from "#config/db";
import { tokenDecorators } from "#config/auth";
import cookieConfig from "#config/cookie";
import corsConfig from "#config/cors";

// Logger
const app = Fastify({
  logger: true,
});

// Environment variables setup
app.register(fastifyEnv, envConfig);

//cors setup
app.register(cors, corsConfig);

app.after(() => {
  // JWT setup
  app.register(jwt, {
    secret: app.envs.APP_KEY,
  });

  // Decorators for auth setup
  app.decorate("generateAccessToken", tokenDecorators.generateAccessToken);
  app.decorate("generateRefreshToken", tokenDecorators.generateRefreshToken);

  // Cookie setup
  app.register(cookie, {
    ...cookieConfig,
    secret: app.envs.APP_KEY,
  });
});

app.register(prisma);
app.register(WebSocket);

export default app;
