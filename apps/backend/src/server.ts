import { configureApp } from "#config/app";

import authRoutes from "#routes/auth_routes";
import userRoutes from "#routes/user_routes";
import twoFactorRoutes from "#routes/twoFactor_routes";
import tournamentRoutes from "#routes/tournament_routes";
import socketRoutes from "#routes/socket_routes";
import leaderboardRoutes from "#routes/leaderboard_routes";
import friendRoutes from "#routes/friend_routes";

import { authMiddleware } from "#middlewares/auth_middleware";

async function start() {
  const app = await configureApp();

  try {
    //middlewares
    await app.register(authMiddleware);

    //routes
    await app.register(authRoutes, { prefix: "/auth" });
    await app.register(userRoutes, { prefix: "/users" });
    await app.register(twoFactorRoutes, { prefix: "/2fa" });
    await app.register(tournamentRoutes, { prefix: "/tournaments" });
    await app.register(socketRoutes, { prefix: "/ws" });
    await app.register(leaderboardRoutes, { prefix: "/leaderboard" });
    await app.register(friendRoutes, { prefix: "/friends" });

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
