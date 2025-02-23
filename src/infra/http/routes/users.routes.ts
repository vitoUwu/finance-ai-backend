import { FastifyInstance } from "fastify";
import { UsersController } from "../controllers/UsersController.js";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated.js";

export async function usersRoutes(app: FastifyInstance) {
  const usersController = new UsersController();

  app.addHook("onRequest", ensureAuthenticated);

  app.get("/me", usersController.me);
}
