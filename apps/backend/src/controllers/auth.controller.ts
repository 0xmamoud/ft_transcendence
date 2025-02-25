import { FastifyRequest, FastifyReply } from "fastify";
import { AuthService } from "#services/auth.service";
import { GoogleService } from "#services/google.service";

export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService
  ) {}

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const token = request.cookies.refreshToken;
      if (token) reply.status(401).send({ message: "Already logged in" });

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
        reply.redirect("/login?error=No code provided");
        return;
      }

      const { accessToken, refreshToken } =
        await this.googleService.handleAuthCallback(code);

      reply.setCookie("refreshToken", refreshToken);
      reply.setCookie("accessToken", accessToken);

      reply.redirect("/profile");
    } catch (error) {
      console.error("Google authentication error:", error);
      reply.redirect(
        `/login?error=${encodeURIComponent("Authentication failed")}`
      );
    }
  }
}
