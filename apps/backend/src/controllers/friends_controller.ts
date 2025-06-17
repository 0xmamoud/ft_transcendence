import { FastifyRequest, FastifyReply } from "fastify";
import { FriendService } from "#services/friend_service";
import { JWTPayload } from "#types/auth_type";

export class FriendsController {
  constructor(private readonly friendService: FriendService) {}

  async index(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as JWTPayload;
      if (!user) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const friends = await this.friendService.getFriendsList(user.userId);
      if (!friends) {
        return reply.status(404).send({ message: "No friends found" });
      }

      return reply.status(200).send(friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as JWTPayload;
      if (!user) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const { friendId } = request.params as { friendId: string };
      if (!friendId || isNaN(parseInt(friendId))) {
        return reply.status(400).send({ message: "Invalid friend ID" });
      }

      const friend = await this.friendService.deleteFriend(
        user.userId,
        parseInt(friendId)
      );
      if (!friend) {
        return reply.status(404).send({ message: "Friend not found" });
      }

      return reply.status(200).send({ message: "Friend deleted successfully" });
    } catch (error) {
      console.error("Error deleting friend:", error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  }

  async store(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as JWTPayload;
      if (!user) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const { username } = request.body as { username: string };
      if (!username) {
        return reply.status(400).send({ message: "Username is required" });
      }

      const friend = await this.friendService.addFriend(user.userId, username);
      if (!friend) {
        return reply
          .status(404)
          .send({ message: "Friend not found or is yourself" });
      }

      return reply.status(200).send({ message: "Friend added successfully" });
    } catch (error) {
      console.error("Error adding friend:", error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  }
}
