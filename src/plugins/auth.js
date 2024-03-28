import fp from "fastify-plugin";
import FastifyJWT from "@fastify/jwt";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import formbody from "@fastify/formbody";
import { generateAndSetTokens } from "../libs/utils.js";

export default fp(
  async function (fastify, opts) {
    await fastify
      .register(FastifyJWT, {
        secret: process.env.JWT_SECRET,
        cookie: {
          cookieName: "accessToken",
        },
      })
      .register(formbody)
      .register(cors, {
        credentials: true,
        origin: ["http://localhost:5173"],
      })
      .register(cookie, {
        hook: "onRequest",
        secret: process.env.COOKIE_SECRET,
      });

    fastify.decorate("authenticate", async function (req, reply) {
      const refreshToken = req.cookies["refreshToken"];

      if (!refreshToken) {
        return reply
          .code(401)
          .send({ error: "No Authorization was found in request.cookies" });
      }
      const user = fastify.jwt.verify(refreshToken);

      if (user) {
        await generateAndSetTokens(req, reply, user);
      }
      try {
        await req.jwtVerify({ cookieOnly: true });
      } catch (err) {
        reply.send(err);
      }
    });

    fastify.decorateRequest("generateToken", function (payload, expiresIn) {
      const token = fastify.jwt.sign(
        {
          ...payload,
        },
        { expiresIn }
      );
      return token;
    });
  },
  {
    name: "auth-plugin",
  }
);
