import { FastifyJWT } from "@fastify/jwt";
import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import fp from "fastify-plugin";

interface JWTPayload {
  userId: number;
  username: string;
}

interface PasswordUtils {
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
}

// Password utilities
export const passwordUtils: PasswordUtils = {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  },

  async verifyPassword(password: string, hash: string): Promise<boolean> {
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
} as const;

// Plugin to add password utilities as decorators
export const passwordPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.decorate("hashPassword", passwordUtils.hashPassword);
  fastify.decorate("verifyPassword", passwordUtils.verifyPassword);
});

// Plugin to add token utilities as decorators
export const tokenPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.decorate("generateAccessToken", tokenUtils.generateAccessToken);
  fastify.decorate("generateRefreshToken", tokenUtils.generateRefreshToken);
});

// Add types for the decorators
declare module "fastify" {
  interface FastifyInstance {
    hashPassword: (password: string) => Promise<string>;
    verifyPassword: (password: string, hash: string) => Promise<boolean>;
    generateAccessToken: (payload: JWTPayload) => Promise<string>;
    generateRefreshToken: (payload: JWTPayload) => Promise<string>;
  }
}
