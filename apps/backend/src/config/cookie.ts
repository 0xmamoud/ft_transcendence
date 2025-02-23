import { FastifyCookieOptions } from "@fastify/cookie";
import { envConfig } from "#config/env";

const cookieMaxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export const cookieConfig: FastifyCookieOptions = {
  parseOptions: {
    path: "/",
    secure: envConfig.schema.properties.NODE_ENV.default === "production",
    httpOnly: true,
    sameSite: "strict",
    maxAge: cookieMaxAge,
    signed: false,
  },
};

export default cookieConfig;
