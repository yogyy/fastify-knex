import autoLoad from "@fastify/autoload";
import fp from "fastify-plugin";
import path from "node:path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configure and starts Fastify server with all required plugins and routes
 * @async
 * @param {import('fastify').FastifyInstance} server - Fastify server instance
 * @param {Object} opts
 * @returns {import('fastify').FastifyInstance} started Fastify server instance
 */
async function plugins(server, opts) {
  server
    .register(import("@fastify/sensible"))
    .register(autoLoad, {
      dir: path.join(__dirname, "plugins"),
      dirNameRoutePrefix: false,
      options: Object.assign({}, opts),
    })
    .register(autoLoad, {
      dir: path.join(__dirname, "routes"),
      dirNameRoutePrefix: true,
      autoHooks: true,
      autoHooksPattern: /.*hook(\.js|\.cjs|\.ts)$/i,
      cascadeHooks: true,
      options: { prefix: "/api" },
    });

  server.setErrorHandler(async function (err, req, reply) {
    req.log.error({ err });
    reply.code(err.statusCode || 500);
    return { error: err.message };
  });
}

export default fp(plugins);
