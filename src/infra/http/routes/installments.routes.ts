import { FastifyInstance } from "fastify";
import { InstallmentsController } from "../controllers/InstallmentsController.js";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated.js";

export async function installmentsRoutes(app: FastifyInstance) {
  const installmentsController = new InstallmentsController();

  app.addHook("onRequest", ensureAuthenticated);

  app.post("/installments", installmentsController.create);
  app.get("/installments", installmentsController.list);
  app.put("/installments/:id", installmentsController.update);
  app.delete("/installments/:id", installmentsController.delete);
}
