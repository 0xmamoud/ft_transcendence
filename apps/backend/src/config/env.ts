const envSchema = {
  type: "object",
  required: ["APP_KEY"],
  properties: {
    APP_KEY: {
      type: "string",
    },
    PORT: {
      type: "number",
      default: 3333,
    },
    NODE_ENV: {
      type: "string",
      default: "development",
    },
  },
};

export const envConfig = {
  confKey: "envs",
  schema: envSchema,
  dotenv: true,
};

declare module "fastify" {
  interface FastifyInstance {
    envs: {
      PORT: number;
      NODE_ENV: string;
      APP_KEY: string;
    };
  }
}
