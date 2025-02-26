import { configureApp } from "#config/app";
import authRoutes from "#routes/auth.route";
import userRoutes from "#routes/user.route";
import twoFactorRoutes from "#routes/twoFactor.route";
import { authMiddleware } from "#middlewares/auth.middleware";

async function start() {
  const app = await configureApp();

  try {
    await app.register(authMiddleware);

    await app.register(authRoutes, { prefix: "/auth" });
    await app.register(userRoutes, { prefix: "/users" });
    await app.register(twoFactorRoutes, { prefix: "/2fa" });

    const address = await app.listen({
      port: app.envs.PORT,
      host: "0.0.0.0",
    });
    console.log(`Server listening at ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
