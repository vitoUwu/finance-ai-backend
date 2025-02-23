import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../../../shared/errors/AppError.js";

interface TokenPayload {
  sub: string;
  name: string;
  email: string;
  iat: number;
  exp: number;
}

export async function ensureAuthenticated(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization;
  const authCookie = request.headers.cookie;

  const token =
    authHeader?.split(" ")[1] ||
    authCookie?.split("token=")[1]?.split(";")?.[0];

  if (!token) {
    throw new UnauthorizedError("Token is missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    request.user = {
      id: decoded.sub,
    };
  } catch {
    throw new UnauthorizedError("Invalid token");
  }
}
