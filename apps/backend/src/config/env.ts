const envSchema = {
  type: "object",
  required: [
    "APP_KEY",
    "DATABASE_URL",
    "API_URL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "CONTRACT_ADDRESS",
    "PRIVATE_KEY",
    "NETWORK_URL",
  ],
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
    DATABASE_URL: {
      type: "string",
    },
    API_URL: {
      type: "string",
    },
    GOOGLE_CLIENT_ID: {
      type: "string",
    },
    GOOGLE_CLIENT_SECRET: {
      type: "string",
    },
    CONTRACT_ADDRESS: {
      type: "string",
    },
    PRIVATE_KEY: {
      type: "string",
    },
    NETWORK_URL: {
      type: "string",
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
      DATABASE_URL: string;
      API_URL: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      CONTRACT_ADDRESS: string;
      PRIVATE_KEY: string;
      NETWORK_URL: string;
    };
  }
}
