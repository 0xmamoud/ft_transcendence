import { FastifyInstance } from "fastify";

export class FriendService {
  constructor(private readonly app: FastifyInstance) {}

  async getFriendsList(userId: number) {
    try {
      const friendRelations = await this.app.db.friend.findMany({
        where: {
          userId,
        },
      });

      const friendIds = friendRelations.map((relation) => relation.friendId);

      if (friendIds.length === 0) {
        return [];
      }

      const friends = await this.app.db.user.findMany({
        where: {
          id: {
            in: friendIds,
          },
        },
        select: {
          id: true,
          username: true,
          avatar: true,
          isOnline: true,
        },
      });

      return friends;
    } catch (error) {
      console.error("Error fetching friends list:", error);
      return null;
    }
  }

  async deleteFriend(userId: number, friendId: number) {
    try {
      return await this.app.db.friend.deleteMany({
        where: {
          userId: userId,
          friendId: friendId,
        },
      });
    } catch (error) {
      console.error("Error deleting friend:", error);
      return null;
    }
  }

  async addFriend(userId: number, username: string) {
    try {
      const friend = await this.app.db.user.findFirst({
        where: { username },
      });

      if (!friend || friend.id === userId) {
        return null;
      }

      return await this.app.db.friend.upsert({
        where: {
          userId_friendId: {
            userId,
            friendId: friend.id,
          },
        },
        create: {
          userId,
          friendId: friend.id,
        },
        update: {}, // on ne met rien à jour si ça existe déjà
      });
    } catch (error) {
      console.error("Error adding friend:", error);
      return null;
    }
  }
}
