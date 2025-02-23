import { PrismaClient } from "@prisma/client";
import { User } from "../../../domain/entities/User.js";
import { IUsersRepository } from "../../../domain/repositories/IUsersRepository.js";
import { User as PrismaUser } from "@prisma/client";

export class PrismaUsersRepository implements IUsersRepository {
  constructor(private prisma: PrismaClient) {}

  private userToEntity(user: PrismaUser): User {
    return {
      ...user,
      avatar: user.avatar || undefined,
      pushSubscription: user.pushSubscription || undefined,
    };
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.userToEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? this.userToEntity(user) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map(this.userToEntity);
  }

  async create(
    data: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User> {
    const user = await this.prisma.user.create({
      data,
    });

    return this.userToEntity(user);
  }

  async save(user: Partial<User>): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: user,
    });

    return this.userToEntity(updatedUser);
  }
}
