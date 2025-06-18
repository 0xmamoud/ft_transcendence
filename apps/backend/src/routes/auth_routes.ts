import { FastifyInstance } from "fastify";
import { loginSchema, registerSchema } from "#schemas/auth_schema";
import { AuthController } from "#controllers/auth_controller";
import { AuthService } from "#services/auth_service";
import { GoogleService } from "#services/google_service";

async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService(app);
  const googleService = new GoogleService(app);
  const authController = new AuthController(authService, googleService, app);

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
