import { FastifyInstance } from "fastify";
import { AccountsController } from "../controllers/AccountsController.js";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated.js";

export async function accountsRoutes(app: FastifyInstance) {
  const accountsController = new AccountsController();

  app.addHook("onRequest", ensureAuthenticated);

  app.post("/accounts", accountsController.create);
  app.get("/accounts", accountsController.list);
  app.put("/accounts/:id", accountsController.update);
  app.delete("/accounts/:id", accountsController.delete);
}
