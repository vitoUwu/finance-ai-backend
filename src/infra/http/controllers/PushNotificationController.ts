import { FastifyReply, FastifyRequest } from "fastify";
import { IUsersRepository } from "../../../domain/repositories/IUsersRepository.js";
import { LoggerService } from "../../../shared/services/LoggerService.js";

export class PushNotificationController {
  constructor(private usersRepository: IUsersRepository) {}

  async subscribe(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { subscription } = request.body as {
        subscription: PushSubscription;
      };
      const userId = (request.user as { sub: string }).sub;

      await this.usersRepository.save({
        id: userId,
        pushSubscription: JSON.stringify(subscription),
      });

      LoggerService.info({
        message: "User subscribed to push notifications",
        metadata: { userId },
      });

      return reply.status(201).send();
    } catch (error) {
      LoggerService.error({
        message: "Failed to subscribe to push notifications",
        error: error as Error,
      });
      return reply.status(500).send({ error: "Internal server error" });
    }
  }

  async getPublicKey(request: FastifyRequest, reply: FastifyReply) {
    return reply.send({ publicKey: process.env.WEB_PUSH_PUBLIC_KEY });
  }
}
