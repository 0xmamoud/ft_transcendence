import { FastifyRequest, FastifyReply } from "fastify";
import { AuthService } from "#services/auth_service";
import { GoogleService } from "#services/google_service";
import { FastifyInstance } from "fastify";

export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
    private readonly app: FastifyInstance
  ) {}

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const token = request.cookies.refreshToken;
      if (token) reply.status(401).send({ message: "Already logged in" });

      const { email, password } = request.body as {
        email: string;
        password: string;
      };
      const result = await this.authService.login(email, password);

      if (result.requires2FA) {
        reply.status(200).send({
          requires2FA: true,
          userId: result.userId,
        });
        return;
      }

      reply.setCookie("refreshToken", result.refreshToken!);
      reply.setCookie("accessToken", result.accessToken!);
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
      const result = await this.authService.register(email, password, username);
      reply.setCookie("refreshToken", result.refreshToken!);
      reply.setCookie("accessToken", result.accessToken!);

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

      await this.authService.logout(request.user.userId, refreshToken);

      reply.clearCookie("refreshToken");
      reply.clearCookie("accessToken");

      reply.status(200).send({ message: "Logged out successfully" });
    } catch (error) {
      console.log("General error:", error);
      reply.status(400).send({ message: "Failed to logout" });
    }
  }

  async googleAuth(request: FastifyRequest, reply: FastifyReply) {
    const authUrl = this.googleService.generateAuthUrl();
    reply.redirect(authUrl);
  }

  async googleAuthCallback(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { code } = request.query as { code: string };

      if (!code) {
        reply.redirect(
          this.app.envs.API_URL + "/api/login?error=No code provided"
        );
        return;
      }

      const { accessToken, refreshToken } =
        await this.googleService.handleAuthCallback(code);

      reply.setCookie("refreshToken", refreshToken);
      reply.setCookie("accessToken", accessToken);

      reply.redirect(this.app.envs.API_URL + "/api/profile");
    } catch (error) {
      console.error("Google authentication error:", error);
      reply.redirect(
        this.app.envs.API_URL +
          `/api/login?error=${encodeURIComponent("Authentication failed")}`
      );
    }
  }
}
