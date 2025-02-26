import { FastifyInstance } from "fastify";

export class AuthService {
  constructor(private readonly app: FastifyInstance) {}

  async login(email: string, password: string) {
    const user = await this.app.db.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await this.app.verify(password, user.password!);

    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    if (user.isTwoFactorEnabled) {
      return {
        requires2FA: true,
        userId: user.id,
      };
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

  async register(email: string, password: string, username: string) {
    const user = await this.app.db.user.create({
      data: {
        email,
        password: await this.app.hash(password),
        username,
      },
    });
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

  async logout(userId: number, refreshToken: string) {
    try {
      const session = await this.app.db.session.findFirst({
        where: {
          userId,
          tokenHash: refreshToken,
        },
      });

      if (!session) {
        throw new Error("Session not found");
      }

      await this.app.db.session.deleteMany({
        where: {
          userId,
          tokenHash: refreshToken,
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }
}
