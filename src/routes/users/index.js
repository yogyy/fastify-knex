/** @param {import('fastify').FastifyInstance & {knex: import('knex').Knex}} app */
export default async function users(app, opts) {
  app.get("/me", { onRequest: [app.authenticate] }, async (req, reply) => {
    try {
      const { email } = req.user;
      const [user] = await app.knex
        .select(["id", "email", "username", "image", "bio", "created_at"])
        .from("knex_users")
        .where("email", email);

      reply.code(200).send(user);
    } catch (err) {
      reply.code(500).send({ message: "Internal Server Error" });
    }
  });

  app.patch("/edit", { onRequest: [app.authenticate] }, async (req, reply) => {
    try {
      const { email } = req.user;
      const [edited] = await app.knex
        .update(req.body)
        .from("knex_users")
        .where("email", email)
        .returning("*");

      reply.code(200).send(edited);
    } catch (err) {
      reply.code(500).send({ message: "Internal Server Error" });
    }
  });
}
