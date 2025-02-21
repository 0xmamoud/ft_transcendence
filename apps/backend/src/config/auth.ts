import { FastifyJWT } from "@fastify/jwt";
import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import fp from "fastify-plugin";

interface JWTPayload {
  userId: number;
  username: string;
}

interface PasswordUtils {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

// Password utilities
export const passwordUtils: PasswordUtils = {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  },

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },
};

// Token utilities
export const tokenUtils = {
  generateAccessToken: async function (
    this: FastifyInstance,
    payload: JWTPayload
  ) {
    return this.jwt.sign(payload, {
      expiresIn: "15m",
    });
  },

  generateRefreshToken: async function (
    this: FastifyInstance,
    payload: JWTPayload
  ) {
    return this.jwt.sign(payload, {
      expiresIn: "30d",
    });
  },

  verifyToken: async function (this: FastifyInstance, token: string) {
    return this.jwt.verify(token) as JWTPayload;
  },
} as const;

// Plugin to add password utilities as decorators
export const hashPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.decorate("hash", passwordUtils.hash);
  fastify.decorate("verify", passwordUtils.verify);
});

// Plugin to add token utilities as decorators
export const tokenPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.decorate("generateAccessToken", tokenUtils.generateAccessToken);
  fastify.decorate("generateRefreshToken", tokenUtils.generateRefreshToken);
  fastify.decorate("verifyToken", tokenUtils.verifyToken);
});

// Add types for the decorators
declare module "fastify" {
  interface FastifyInstance {
    hash: (password: string) => Promise<string>;
    verify: (password: string, hash: string) => Promise<boolean>;
    generateAccessToken: (payload: JWTPayload) => Promise<string>;
    generateRefreshToken: (payload: JWTPayload) => Promise<string>;
    verifyToken: (token: string) => Promise<JWTPayload>;
  }
}
