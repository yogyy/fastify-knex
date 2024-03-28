import fp from "fastify-plugin";

export default fp(
  async function (fastify, opts) {
    fastify.decorate("usersDataSource", {
      findUser: async (email) => {
        const [user] = await fastify.knex
          .select("*")
          .from("knex_users")
          .where("email", email);
        if (!user || user.length === 0) {
          return null;
        }
        return user;
      },
    });
  },
  {
    encapsulate: true,
  }
);
