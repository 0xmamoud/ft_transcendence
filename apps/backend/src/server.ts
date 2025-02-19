import app from "#config/app";

const start = async () => {
  try {
    await app.listen({ port: app.envs.PORT });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
