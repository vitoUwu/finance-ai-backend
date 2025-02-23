import { prisma } from "../../../infra/database/prisma.js";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AuthenticateUserUseCase } from "../../../application/use-cases/auth/AuthenticateUserUseCase.js";
import { GoogleAuthProvider } from "../../../shared/providers/auth/implementations/GoogleAuthProvider.js";
import { PrismaUsersRepository } from "../../database/repositories/PrismaUsersRepository.js";
import { LoggerService } from "../../../shared/services/LoggerService.js";

export class AuthController {
  async googleAuth(request: FastifyRequest, reply: FastifyReply) {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
      process.env.GOOGLE_CLIENT_ID
    }&redirect_uri=${encodeURIComponent(
      process.env.GOOGLE_CALLBACK_URL!
    )}&response_type=code&scope=email profile&access_type=offline`;

    return reply.redirect(authUrl);
  }

  async googleCallback(request: FastifyRequest, reply: FastifyReply) {
    const { code } = request.query as { code: string };

    try {
      const googleAuthProvider = new GoogleAuthProvider();
      const { profile } = await googleAuthProvider.getTokensAndProfile(code);

      const usersRepository = new PrismaUsersRepository(prisma);
      const authenticateUser = new AuthenticateUserUseCase(
        usersRepository,
        googleAuthProvider
      );

      const { token } = await authenticateUser.execute({
        googleProfile: profile,
      });

      // Redirecionar para o frontend com o token
      reply.headers({
        "set-cookie": `token=${token}; HttpOnly; Path=/; Max-Age=3600; Secure; SameSite=Strict`,
      });
      return reply.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?token=${token}`,
        302
      );
    } catch (error) {
      LoggerService.error({
        message: "Error in Google callback",
        error: error as Error,
      });
      return reply.redirect(`${process.env.FRONTEND_URL}/auth/error`);
    }
  }

  async authenticate(request: FastifyRequest, reply: FastifyReply) {
    const authenticateBodySchema = z.object({
      token: z.string(),
    });

    const { token } = authenticateBodySchema.parse(request.body);

    const usersRepository = new PrismaUsersRepository(prisma);
    const googleAuthProvider = new GoogleAuthProvider();

    const authenticateUser = new AuthenticateUserUseCase(
      usersRepository,
      googleAuthProvider
    );

    const { user, token: jwtToken } = await authenticateUser.execute({
      accessToken: token,
    });

    return reply.status(200).send({
      user,
      token: jwtToken,
    });
  }
}
