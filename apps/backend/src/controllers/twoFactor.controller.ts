import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { TwoFactorService } from "#services/twoFactor.service";
import { JWTPayload } from "#types/auth.type";

export class TwoFactorController {
  constructor(
    private readonly twoFactorService: TwoFactorService,
    private readonly app: FastifyInstance
  ) {}

  async generateQR(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as JWTPayload;
      const { qrCode } = await this.twoFactorService.generateSecret(
        user.userId
      );

      reply.status(200).send({
        qrCode,
        message: "Scan this QR code with Google Authenticator",
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      reply.status(500).send({ message: "Failed to generate QR code" });
    }
  }

  async enable(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as JWTPayload;
      const { token } = request.body as { token: string };

      await this.twoFactorService.enable2FA(user.userId, token);

      reply.status(200).send({ message: "2FA enabled successfully" });
    } catch (error) {
      console.error("Error enabling 2FA:", error);
      reply.status(400).send({ message: "Failed to enable 2FA" });
    }
  }

  async verify(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as JWTPayload;
      const { token } = request.body as { token: string };

      const isValid = await this.twoFactorService.verify(user.userId, token);

      if (!isValid) {
        reply.status(401).send({ message: "Invalid 2FA token" });
        return;
      }

      reply.status(200).send({ message: "2FA verification successful" });
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      reply.status(401).send({ message: "Invalid 2FA token" });
    }
  }

  async loginWith2FA(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId, token } = request.body as {
        userId: number;
        token: string;
      };

      const isValid = await this.twoFactorService.verify(userId, token);

      if (!isValid) {
        reply.status(401).send({ message: "Invalid 2FA token" });
        return;
      }

      const { accessToken, refreshToken } =
        await this.twoFactorService.loginWith2FA(userId, token);

      reply.setCookie("refreshToken", refreshToken);
      reply.setCookie("accessToken", accessToken);
      reply.status(200).send({ message: "Logged in successfully" });
    } catch (error) {
      console.error("Error logging in with 2FA:", error);
      reply.status(401).send({ message: "Invalid 2FA token" });
    }
  }
}
