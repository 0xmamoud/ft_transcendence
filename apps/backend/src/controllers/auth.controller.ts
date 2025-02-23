import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { AuthService } from "#services/auth.service";

export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly app: FastifyInstance
  ) {}

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const token = request.cookies.refreshToken;
      if (token)
        reply.status(401).send({ message: "Already logged in" });

      const { email, password } = request.body as {
        email: string;
        password: string;
      };
      const { accessToken, refreshToken } = await this.authService.login(
        email,
        password
      );
      reply.setCookie("refreshToken", refreshToken);
      reply.setCookie("accessToken", accessToken);
      reply.status(200).send({ message: "Logged in successfully" });
    } catch (error) {
      reply.status(401).send({ message: "Invalid credentials" });
    }
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password, username } = request.body as {
        email: string;
        password: string;
        username: string;
      };
      await this.authService.register(email, password, username);
      reply.status(200).send({ message: "Registered successfully" });
    } catch (error) {
      reply.status(400).send({ message: "Failed to register" });
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const refreshToken = request.cookies.refreshToken;
      if (!refreshToken) {
        reply.status(401).send({ message: "Unauthorized" });
        return;
      }

        const user = await this.app.verifyToken(refreshToken);
        await this.authService.logout(user.userId, refreshToken);

        reply.clearCookie("refreshToken");
        reply.clearCookie("accessToken");

      reply.status(200).send({ message: "Logged out successfully" });
    } catch (error) {
      console.log("General error:", error);
      reply.status(400).send({ message: "Failed to logout" });
    }
  }
}
