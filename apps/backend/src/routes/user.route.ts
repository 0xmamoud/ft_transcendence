import { FastifyInstance } from "fastify";
import { UserController } from "#controllers/user.controller";
import { UserService } from "#services/user.service";

async function userRoutes(app: FastifyInstance) {
  const userService = new UserService(app);
  const userController = new UserController(userService);

  app.addHook("onRequest", app.authenticate);

  app.get("/me", userController.getMe);
  app.get("/:id", userController.getUserById);
}

export default userRoutes;
