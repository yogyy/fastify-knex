/** @typedef { import('fastify').FastifyRequest & { generateToken: Promise<string>} } Request */
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} username
 */

/**
 * @param { Request } req
 * @param { User } user
 * @returns {Promise<string>} The access token.
 */
export const generateAccToken = async (req, user) => {
  try {
    const accessToken = await req.generateToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    });
    const refreshToken = await req.generateToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    return accessToken;
  } catch (error) {
    console.error("Error generating access token:", error);
    throw new Error("Failed to generate access token");
  }
};
