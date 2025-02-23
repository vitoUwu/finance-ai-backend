import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/AuthController.js";

export async function authRoutes(app: FastifyInstance) {
  const authController = new AuthController();

  // Rota que inicia o fluxo de autenticação
  app.get("/auth/google", authController.googleAuth);

  // Callback do Google
  app.get("/auth/google/callback", authController.googleCallback);

  // Login com access token (mantendo compatibilidade)
  app.post("/sessions", authController.authenticate);
}
