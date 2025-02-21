export const loginSchema = {
  schema: {
    body: {
      type: "object",
      required: ["email", "password"],
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 4 },
      },
    },
    consumes: [ "multipart/form-data"],
  },
};

export const registerSchema = {
  schema: {
    body: {
      type: "object",
      required: ["email", "password", "username"],
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 4 },
        username: { type: "string", minLength: 3 },
      },
    },
    consumes: ["application/json", "multipart/form-data"],
  },
};
