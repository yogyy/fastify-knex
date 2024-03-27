import fp from "fastify-plugin";
import knex from "knex";

const knexPlugin = fp(function (fastify, opts, next) {
  try {
    const handler = knex({
      client: "pg",
      connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      },
    });

    fastify.decorate("knex", handler).addHook("onClose", (instance, done) => {
      if (instance.knex === knex) {
        instance.knex.destroy(done);
      }
    });

    next();
  } catch (err) {
    next(err);
  }
});

export default knexPlugin;
