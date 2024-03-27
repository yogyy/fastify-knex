/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const config = {
  development: {
    client: "postgresql",
    connection: {
      uri: process.env.DB_URI,
    },
    migrations: {
      directory: "./knex/migrations",
    },
    seeds: {
      directory: "./knex/seeds",
    },
    useNullAsDefault: true,
  },
};

export default config;
