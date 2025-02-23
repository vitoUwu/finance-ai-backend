import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { CreateCategoryUseCase } from "../../../application/use-cases/categories/CreateCategoryUseCase.js";
import { DeleteCategoryUseCase } from "../../../application/use-cases/categories/DeleteCategoryUseCase.js";
import { ListUserCategoriesUseCase } from "../../../application/use-cases/categories/ListUserCategoriesUseCase.js";
import { PrismaCategoriesRepository } from "../../database/repositories/PrismaCategoriesRepository.js";
import { PrismaTransactionsRepository } from "../../database/repositories/PrismaTransactionsRepository.js";
import { UpdateCategoryUseCase } from "../../../application/use-cases/categories/UpdateCategoryUseCase.js";

export class CategoriesController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const createCategoryBodySchema = z.object({
      name: z.string(),
      color: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color"),
    });

    const data = createCategoryBodySchema.parse(request.body);

    const categoriesRepository = new PrismaCategoriesRepository();
    const createCategory = new CreateCategoryUseCase(categoriesRepository);

    const category = await createCategory.execute({
      ...data,
      userId: (request.user as { id: string }).id,
    });

    return reply.status(201).send(category);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const categoriesRepository = new PrismaCategoriesRepository();
    const listCategories = new ListUserCategoriesUseCase(categoriesRepository);

    const categories = await listCategories.execute({
      userId: (request.user as { id: string }).id,
    });

    return reply.send(categories);
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const deleteCategoryParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = deleteCategoryParamsSchema.parse(request.params);

    const categoriesRepository = new PrismaCategoriesRepository();
    const transactionsRepository = new PrismaTransactionsRepository();
    const deleteCategory = new DeleteCategoryUseCase(
      categoriesRepository,
      transactionsRepository
    );

    await deleteCategory.execute({
      categoryId: id,
      userId: (request.user as { id: string }).id,
    });

    return reply.status(204).send();
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const updateCategoryParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const updateCategoryBodySchema = z.object({
      name: z.string().optional(),
      color: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color")
        .optional(),
    });

    const { id } = updateCategoryParamsSchema.parse(request.params);
    const data = updateCategoryBodySchema.parse(request.body);

    const categoriesRepository = new PrismaCategoriesRepository();
    const updateCategory = new UpdateCategoryUseCase(categoriesRepository);

    const category = await updateCategory.execute({
      categoryId: id,
      userId: (request.user as { id: string }).id,
      ...data,
    });

    return reply.send(category);
  }
}
