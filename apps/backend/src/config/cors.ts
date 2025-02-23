import { FastifyCorsOptions } from "@fastify/cors";

export const corsConfig: FastifyCorsOptions = {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  exposedHeaders: ["set-cookie"],
};

export default corsConfig;
