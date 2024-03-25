import { build } from "./app.js";

const opts = {};
if (process.stdout.isTTY) {
  opts.logger = {
    transport: {
      target: "pino-pretty",
    },
  };
} else {
  opts.logger = true;
}

/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function (app, opts) {
  app.get("/", async (req, reply) => {
    return { hello: "world" };
  });
}
