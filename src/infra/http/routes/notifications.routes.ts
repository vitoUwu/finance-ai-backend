import { FastifyInstance } from "fastify";
import { prisma } from "../../database/prisma.js";
import { PrismaUsersRepository } from "../../database/repositories/PrismaUsersRepository.js";
import { PushNotificationController } from "../controllers/PushNotificationController.js";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated.js";

export async function notificationsRoutes(app: FastifyInstance) {
  const pushNotificationController = new PushNotificationController(
    new PrismaUsersRepository(prisma)
  );

  app.get(
    "/notifications/push/public-key",
    {
      onRequest: [ensureAuthenticated],
    },
    pushNotificationController.getPublicKey.bind(pushNotificationController)
  );

  app.post(
    "/notifications/push/subscribe",
    {
      onRequest: [ensureAuthenticated],
    },
    pushNotificationController.subscribe.bind(pushNotificationController)
  );
}
