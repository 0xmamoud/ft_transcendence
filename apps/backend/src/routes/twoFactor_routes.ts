import { FastifyInstance } from "fastify";
import { TwoFactorController } from "#controllers/twoFactor_controller";
import { TwoFactorService } from "#services/twoFactor_service";

async function twoFactorRoutes(app: FastifyInstance) {
  const twoFactorService = new TwoFactorService(app);
  const twoFactorController = new TwoFactorController(twoFactorService, app);

  app.get(
    "/qr",
    { preHandler: [app.authenticate] },
    twoFactorController.generateQR.bind(twoFactorController)
  );

  app.post(
    "/enable",
    { preHandler: [app.authenticate] },
    twoFactorController.enable.bind(twoFactorController)
  );

  app.post(
    "/verify",
    { preHandler: [app.authenticate] },
    twoFactorController.verify.bind(twoFactorController)
  );

  app.post(
    "/login-with-2fa",
    twoFactorController.loginWith2FA.bind(twoFactorController)
  );
}

export default twoFactorRoutes;
