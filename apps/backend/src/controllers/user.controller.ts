import { FastifyRequest, FastifyReply } from "fastify";
import { UserService } from "#services/user.service";
import { JWTPayload } from "#types/auth.type";
import { UserProfile } from "#types/user.type";

export class UserController {
  constructor(private readonly userService: UserService) {}

  getMe = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JWTPayload;

      if (!user) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const userData = await this.userService.getMe(user.userId);
      return reply.status(200).send(userData);
    } catch (error) {
      console.error("Error in getMe controller:", error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  };

  getUserById = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };

      if (!id || isNaN(parseInt(id))) {
        return reply.status(400).send({ message: "Invalid user ID" });
      }

      const userId = parseInt(id);
      const userData = await this.userService.getUserById(userId);

      return reply.status(200).send(userData);
    } catch (error) {
      if ((error as Error).message === "User not found") {
        return reply.status(404).send({ message: "User not found" });
      }

      console.error("Error in getUserById controller:", error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  };

  updateUserProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JWTPayload;
      if (!user) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const data = request.body as Partial<UserProfile>;
      const updatedUser = await this.userService.updateUserProfile(
        user.userId,
        data
      );

      return reply.status(200).send(updatedUser);
    } catch (error) {
      console.error("Error in updateUserProfile controller:", error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  };

  getUserMatchHistory = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const user = request.user as JWTPayload;
      if (!user) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const matchHistory = await this.userService.getUserMatchHistory(
        user.userId
      );
      return reply.status(200).send(matchHistory);
    } catch (error) {
      console.error("Error in getUserMatchHistory controller:", error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  };
}
