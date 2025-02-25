import { FastifyInstance } from "fastify";
import { loginSchema, registerSchema } from "#schemas/auth.schema";
import { AuthController } from "#controllers/auth.controller";
import { AuthService } from "#services/auth.service";

async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService(app);
  const authController = new AuthController(authService);

  app.post("/login", loginSchema, authController.login.bind(authController));
  app.post(
    "/register",
    registerSchema,
    authController.register.bind(authController)
  );
  app.post(
    "/logout",
    { preHandler: app.authenticate },
    authController.logout.bind(authController)
  );
}
export default authRoutes;
