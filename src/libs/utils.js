/** @typedef { import('fastify').FastifyRequest  } Request */
/** @typedef { import('fastify').FastifyReply  } Reply */
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} username
 */

/**
 * @param { Request &  { generateToken: (payload: Object, expiresIn: string) => Promise<string>} } req
 * @param { User } user
 * @returns {Promise<string>} The access token.
 */
export const generateAccToken = async (req, user) => {
  try {
    const accessToken = await req.generateToken(
      {
        sub: user.id || user.sub,
        email: user.email,
        username: user.username,
      },
      "1m"
    );
    const refreshToken = await req.generateToken(
      {
        sub: user.id || user.sub,
        email: user.email,
        username: user.username,
      },
      "5m"
    );

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating access token:", error);
    throw new Error("Failed to generate access token");
  }
};

/**
 * @param { Request } req
 * @param { Reply } reply
 * @param { User } user
 */
export const generateAndSetTokens = async (req, reply, user) => {
  const { accessToken, refreshToken } = await generateAccToken(req, user);

  reply
    .setCookie("accessToken", accessToken, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1 * 60 * 1000),
      secure: true,
    })
    .setCookie("refreshToken", refreshToken, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 5 * 60 * 1000),
      secure: true,
    });
};
