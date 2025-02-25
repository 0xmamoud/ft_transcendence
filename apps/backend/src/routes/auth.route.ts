import { FastifyInstance } from "fastify";
import { loginSchema, registerSchema } from "#schemas/auth.schema";
import { AuthController } from "#controllers/auth.controller";
import { AuthService } from "#services/auth.service";
import { GoogleService } from "#services/google.service";

async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService(app);
  const googleService = new GoogleService(app);
  const authController = new AuthController(authService, googleService);

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

  app.get("/google", authController.googleAuth.bind(authController));
  app.get(
    "/google/callback",
    authController.googleAuthCallback.bind(authController)
  );
}
export default authRoutes;
