import "dotenv/config";

import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import fastify from "fastify";
import { errorHandler } from "./infra/http/middlewares/errorHandler.js";
import { accountsRoutes } from "./infra/http/routes/accounts.routes.js";
import { authRoutes } from "./infra/http/routes/auth.routes.js";
import { categoriesRoutes } from "./infra/http/routes/categories.routes.js";
import { installmentsRoutes } from "./infra/http/routes/installments.routes.js";
import { subscriptionsRoutes } from "./infra/http/routes/subscriptions.routes.js";
import { transactionsRoutes } from "./infra/http/routes/transactions.routes.js";
import { usersRoutes } from "./infra/http/routes/users.routes.js";

const app = fastify();

app.register(cors, {
  origin: process.env.FRONTEND_URL!,
  credentials: true,
});
app.register(jwt, {
  secret: process.env.JWT_SECRET!,
});

app.setErrorHandler(errorHandler);

app.register(authRoutes);
app.register(transactionsRoutes);
app.register(accountsRoutes);
app.register(categoriesRoutes);
app.register(subscriptionsRoutes);
app.register(installmentsRoutes);
app.register(usersRoutes);

// Configurar jobs
// setupCronJobs();

const port = Number(process.env.PORT) || 3333;

app.listen({ port: isNaN(port) ? 3333 : port }).then(() => {
  console.log(`🚀 HTTP Server Running on port ${port}`);
});
