import { User } from "../../../domain/entities/User.js";
import { IUsersRepository } from "../../../domain/repositories/IUsersRepository.js";
import { NotFoundError } from "../../../shared/errors/AppError.js";

interface GetUserProfileRequest {
  userId: string;
}

export class GetUserProfileUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute({ userId }: GetUserProfileRequest): Promise<User> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User");
    }

    return user;
  }
}
