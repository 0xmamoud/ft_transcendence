const envSchema = {
	type: "object",
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
	dotenv: true,
	schema: envSchema,
	data: process.env,
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