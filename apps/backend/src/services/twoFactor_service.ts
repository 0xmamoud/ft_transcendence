import { FastifyInstance } from "fastify";
import { authenticator } from "otplib";
import QRCode from "qrcode";

export class TwoFactorService {
  constructor(private readonly app: FastifyInstance) {}

  async generateSecret(userId: number) {
    const secret = authenticator.generateSecret();
    authenticator.options = {
      window: 1,
    };

    const user = await this.app.db.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        isTwoFactorEnabled: false,
      },
    });

    const otpauth = authenticator.keyuri(
      user.username,
      "FT_Transcendence",
      secret
    );
    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    return {
      secret,
      qrCode: qrCodeUrl,
    };
  }

  async verify(userId: number, token: string) {
    const user = await this.app.db.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true },
    });

    if (!user?.twoFactorSecret) {
      return false;
    }

    return authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    });
  }

  async enable2FA(userId: number, token: string) {
    const isValid = await this.verify(userId, token);

    if (!isValid) {
      return false;
    }

    await this.app.db.user.update({
      where: { id: userId },
      data: {
        isTwoFactorEnabled: true,
      },
    });

    return true;
  }

  async loginWith2FA(userId: number, token: string) {
    const isValid = await this.verify(userId, token);

    if (!isValid) {
      throw new Error("Invalid 2FA token");
    }

    const user = await this.app.db.user.findUnique({
      where: { id: userId },
      select: { username: true, id: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const accessToken = await this.app.generateAccessToken({
      userId: user.id,
      username: user.username,
    });
    const refreshToken = await this.app.generateRefreshToken({
      userId: user.id,
      username: user.username,
    });

    await this.app.db.session.create({
      data: {
        userId: user.id,
        tokenHash: refreshToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
