import { FastifyInstance } from "fastify";
import { UserProfile, UserPublicProfile } from "#types/user.type";

export class UserService {
  constructor(private readonly app: FastifyInstance) {}

  async getMe(userId: number): Promise<UserProfile> {
    try {
      const user = await this.app.db.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user as UserProfile;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  async getUserById(userId: number): Promise<UserPublicProfile> {
    try {
      const user = await this.app.db.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user as UserPublicProfile;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw error;
    }
  }
}
