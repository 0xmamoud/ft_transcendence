import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { JWTPayload } from "#types/auth_type";

export class AuthMiddleware {
  constructor(private readonly app: FastifyInstance) {}

  private async verifyAccessToken(request: FastifyRequest): Promise<boolean> {
    const accessToken = request.cookies.accessToken;

    if (!accessToken) {
      return false;
    }

    try {
      const user = await this.app.verifyToken(accessToken);
      request.user = user;

      return true;
    } catch (error) {
      return false;
    }
  }

  private async refreshAccessToken(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<boolean> {
    const refreshToken = request.cookies.refreshToken;

    if (!refreshToken) {
      return false;
    }

    try {
      const user = await this.app.verifyToken(refreshToken);

      const session = await this.app.db.session.findFirst({
        where: {
          userId: user.userId,
          tokenHash: refreshToken,
        },
      });

      if (!session) {
        return false;
      }

      const newAccessToken = await this.app.generateAccessToken({
        userId: user.userId,
        username: user.username,
      });

      reply.setCookie("accessToken", newAccessToken);
      request.user = user;

      return true;
    } catch (error) {
      return false;
    }
  }

  public async authenticate(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const isAccessTokenValid = await this.verifyAccessToken(request);
      if (isAccessTokenValid) {
        return;
      }

      const isRefreshSuccessful = await this.refreshAccessToken(request, reply);
      if (isRefreshSuccessful) {
        return;
      }

      throw new Error("Forbidden");
    } catch (error) {
      reply.clearCookie("accessToken");
      reply.clearCookie("refreshToken");
      reply.status(401).send({ message: "Unauthorized" });
    }
  }
}

export const authMiddleware = fp(async (app: FastifyInstance) => {
  const middleware = new AuthMiddleware(app);

  app.decorate("authenticate", middleware.authenticate.bind(middleware));
});

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: JWTPayload;
  }
}
