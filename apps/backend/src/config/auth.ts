import { FastifyJWT } from "@fastify/jwt";
import { FastifyInstance } from "fastify";

interface JWTPayload {
  userId: number;
  username: string;
}

interface TokenGenerators {
  jwt: FastifyJWT;
  generateAccessToken(payload: JWTPayload): Promise<string>;
  generateRefreshToken(payload: JWTPayload): Promise<string>;
}

export const tokenDecorators: Partial<TokenGenerators> = {
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
};
