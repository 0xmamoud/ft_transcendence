import { configureApp } from "#config/app";
import authRoutes from "#routes/auth.route";

async function start() {
  const app = await configureApp();

  try {
    await app.register(authRoutes, { prefix: "/auth" });

    const address = await app.listen({ port: app.envs.PORT });
    console.log(`Server listening at ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
