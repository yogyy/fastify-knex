import fastify from "fastify";
import startServer from "./src/server.js";
import "dotenv/config";

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

const main = async () => {
  process.on("unhandledRejection", (err) => {
    console.error(err);
    process.exit(1);
  });

  const server = fastify(opts);
  server.register(startServer);

  await server.listen({ port: 3000 });
};

main();
