import { FastifyInstance } from "fastify";
import { GoogleUserInfo } from "#types/auth_type";

export class GoogleService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private tokenEndpoint = "https://oauth2.googleapis.com/token";
  private authEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
  private userInfoEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";

  constructor(private readonly app: FastifyInstance) {
    this.clientId = app.envs.GOOGLE_CLIENT_ID;
    this.clientSecret = app.envs.GOOGLE_CLIENT_SECRET;
    this.redirectUri = `${app.envs.API_URL}/api/auth/google/callback`;
  }

  generateAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: "email profile",
      prompt: "consent",
    });

    return `${this.authEndpoint}?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string) {
    const params = new URLSearchParams({
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      grant_type: "authorization_code",
    });

    const response = await fetch(this.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    return response.json();
  }

  async fetchUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch(this.userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.json();
  }

  async handleAuthCallback(code: string) {
    const tokenData = await this.exchangeCodeForToken(code);

    if (!tokenData.access_token) {
      throw new Error("Failed to get access token from Google");
    }

    const userInfo = await this.fetchUserInfo(tokenData.access_token);

    if (!userInfo.email) {
      throw new Error("Failed to get user info from Google");
    }

    let user = await this.app.db.user.findUnique({
      where: { email: userInfo.email },
    });

    if (!user) {
      let username =
        userInfo.name || `user_${Math.random().toString(36).substring(2, 15)}`;

      const existingUser = await this.app.db.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        username = `user_${Math.random()
          .toString(36)
          .substring(2, 10)}_${Date.now()}`;
      }

      user = await this.app.db.user.create({
        data: {
          email: userInfo.email,
          username,
          avatar: userInfo.picture,
          isOnline: true,
        },
      });
    }

    const accessToken = await this.app.generateAccessToken({
      userId: user.id,
      username: user.username,
    });

    const refreshToken = await this.app.generateRefreshToken({
      userId: user.id,
      username: user.username,
    });

    await this.app.db.user.update({
      where: { id: user.id },
      data: { isOnline: true },
    });

    await this.app.db.session.create({
      data: {
        userId: user.id,
        tokenHash: refreshToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}
