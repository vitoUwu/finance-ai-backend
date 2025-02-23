import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../../shared/errors/AppError.js";
import { ZodError } from "zod";

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      status: "error",
      message: error.message,
    });
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      status: "error",
      message: "Validation error",
      issues: error.format(),
    });
  }

  console.error(error);

  return reply.status(500).send({
    status: "error",
    message: "Internal server error",
  });
}
