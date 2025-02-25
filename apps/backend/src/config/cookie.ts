import { FastifyCookieOptions } from "@fastify/cookie";

const cookieMaxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// export const cookieConfig: FastifyCookieOptions = {
//   parseOptions: {
//     path: "/",
//     secure: app.envs.NODE_ENV === "production",
//     httpOnly: true,
//     sameSite: "strict",
//     maxAge: cookieMaxAge,
//     signed: false,
//   },
// };

// export default cookieConfig;

export function createCookieConfig(envs: any): FastifyCookieOptions {
  const cookieMaxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

  return {
    parseOptions: {
      path: "/",
      secure: envs.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
      maxAge: cookieMaxAge,
      signed: false,
    },
  };
}
