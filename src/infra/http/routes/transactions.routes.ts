import { FastifyInstance } from "fastify";
import { TransactionsController } from "../controllers/TransactionsController.js";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated.js";

export async function transactionsRoutes(app: FastifyInstance) {
  const transactionsController = new TransactionsController();

  app.addHook("onRequest", ensureAuthenticated);

  app.post("/transactions", transactionsController.create);
  app.get("/transactions", transactionsController.list);
  app.put("/transactions/:id", transactionsController.update);
  app.delete("/transactions/:id", transactionsController.delete);
  app.post("/transactions/generate", transactionsController.generate);
}
