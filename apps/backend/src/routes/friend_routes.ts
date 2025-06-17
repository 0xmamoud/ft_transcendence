import { FastifyInstance } from "fastify";
import { FriendsController } from "#controllers/friends_controller";
import { FriendService } from "#services/friend_service";

export default async function friendRoutes(app: FastifyInstance) {
  const friendService = new FriendService(app);
  const friendsController = new FriendsController(friendService);

  app.addHook("onRequest", app.authenticate);

  app.get("/", friendsController.index.bind(friendsController));
  app.post("/", friendsController.store.bind(friendsController));
  app.delete("/:friendId", friendsController.delete.bind(friendsController));
}
