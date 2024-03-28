import { Argon2id } from "oslo/password";
import { generateAccToken, generateAndSetTokens } from "../../libs/utils.js";
import fp from "fastify-plugin";

/** @param {import('fastify').FastifyInstance & { knex: import('knex').Knex}} app */
async function auths(app, opts) {
  const argon2id = new Argon2id();

  app.post("/signup", async (req, reply) => {
    const { email, username, password } = req.body;

    if (password.length < 6) {
      return reply
        .code(400)
        .send({ error: "Password must be at least 6 characters long." });
    }

    try {
      const hash = await argon2id.hash(password);
      const [user] = await app
        .knex("knex_users")
        .insert({ email, username, password: hash })
        .returning(["id", "email", "username"]);

      await generateAndSetTokens(req, reply, user);
      reply.code(200).send({ message: "cookies sent." });
    } catch (err) {
      if (err.code === "23505") {
        const errorMessage =
          err.constraint === "knex_users_email_unique"
            ? "Email address"
            : "Username";
        reply.code(400).send({ error: `${errorMessage} is already in use.` });
      } else {
        console.error("Error:", err);
        reply.code(500).send({ error: "An unexpected error occurred." });
      }
    }
  });

  app.post("/signin", async (req, reply) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return reply.code(401).send({
        message: "Invalid email or password",
      });
    }

    try {
      const user = await app.usersDataSource.findUser(email);

      if (!user) {
        return reply.code(404).send({ message: "User not found" });
      }
      const matchPassword = await argon2id.verify(user.password, password);

      if (!matchPassword) {
        return reply.code(401).send({
          message: "Authentication failed. Incorrect password.",
        });
      }

      await generateAndSetTokens(req, reply, user);
      reply.code(200).send({ message: "cookies sent." });
    } catch (err) {
      console.error("Error:", err);
      reply.code(500).send({ error: "An unexpected error occurred." });
    }
  });

  app.delete(
    "/signout",
    { onRequest: [app.authenticate] },
    async (req, reply) => {
      try {
        reply
          .clearCookie("accessToken")
          .clearCookie("refreshToken")
          .code(200)
          .send({ message: "Successfully signed out" });
      } catch (error) {
        console.error("Error during signout:", error);
        reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );

  app.post(
    "/refresh",
    { onRequest: [app.authenticate] },
    async (req, reply) => {
      const { accessToken, refreshToken } = await generateAccToken(
        req,
        req.user
      );

      reply
        .setCookie("accessToken", accessToken, {
          path: "/",
          httpOnly: true,
          expires: new Date(Date.now() + 15 * 60 * 1000),
          secure: true,
        })
        .setCookie("refreshToken", refreshToken, {
          path: "/",
          httpOnly: true,
          expires: new Date(Date.now() + 60 * 60 * 1000 * 7),
          secure: true,
        });
    }
  );
}

export default fp(auths, { name: "auth-routes", encapsulate: true });
