import { FastifyReply, FastifyRequest } from "fastify";
import { GetUserProfileUseCase } from "../../../application/use-cases/users/GetUserProfileUseCase.js";
import { prisma } from "../../../infra/database/prisma.js";
import { PrismaUsersRepository } from "../../database/repositories/PrismaUsersRepository.js";

export class UsersController {
  async me(request: FastifyRequest, reply: FastifyReply) {
    const usersRepository = new PrismaUsersRepository(prisma);
    const getUserProfile = new GetUserProfileUseCase(usersRepository);

    const user = await getUserProfile.execute({
      userId: (request.user as { id: string }).id,
    });

    return reply.send(user);
  }
}
