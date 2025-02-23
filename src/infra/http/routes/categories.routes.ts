import { FastifyInstance } from "fastify";
import { CategoriesController } from "../controllers/CategoriesController.js";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated.js";

export async function categoriesRoutes(app: FastifyInstance) {
  const categoriesController = new CategoriesController();

  app.addHook("onRequest", ensureAuthenticated);

  app.post("/categories", categoriesController.create);
  app.get("/categories", categoriesController.list);
  app.put("/categories/:id", categoriesController.update);
  app.delete("/categories/:id", categoriesController.delete);
}
