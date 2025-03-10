import { FastifyInstance } from "fastify";
import { UserController } from "#controllers/user.controller";
import { UserService } from "#services/user.service";
import { FileService } from "#services/file.service";

async function userRoutes(app: FastifyInstance) {
  const userService = new UserService(app);
  const fileService = new FileService();
  const userController = new UserController(userService, fileService);

  app.addHook("onRequest", app.authenticate);

  app.get("/me", userController.getMe);
  app.put("/me", userController.updateUserProfile);
  app.get("/me/match-history", userController.getUserMatchHistory);
  app.get("/:id", userController.getUserById);
}

export default userRoutes;
