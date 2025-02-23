import { FastifyInstance } from "fastify";
import { SubscriptionsController } from "../controllers/SubscriptionsController.js";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated.js";

export async function subscriptionsRoutes(app: FastifyInstance) {
  const subscriptionsController = new SubscriptionsController();

  app.addHook("onRequest", ensureAuthenticated);

  app.post("/subscriptions", subscriptionsController.create);
  app.get("/subscriptions", subscriptionsController.list);
  app.put("/subscriptions/:id", subscriptionsController.update);
  app.delete("/subscriptions/:id", subscriptionsController.delete);
}
