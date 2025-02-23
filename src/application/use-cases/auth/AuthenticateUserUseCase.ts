import { GoogleUser } from "../../../domain/entities/GoogleUser.js";
import { User } from "../../../domain/entities/User.js";
import { IUsersRepository } from "../../../domain/repositories/IUsersRepository.js";
import { IGoogleAuthProvider } from "../../../shared/providers/auth/IGoogleAuthProvider.js";
import jwt from "jsonwebtoken";

interface AuthenticateUserRequest {
  accessToken?: string;
  googleProfile?: GoogleUser;
}

interface AuthenticateUserResponse {
  user: User;
  token: string;
}

export class AuthenticateUserUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private googleAuthProvider: IGoogleAuthProvider
  ) {}

  async execute({
    accessToken,
    googleProfile,
  }: AuthenticateUserRequest): Promise<AuthenticateUserResponse> {
    let googleUser: GoogleUser;

    if (accessToken) {
      googleUser = await this.googleAuthProvider.validateAccessToken(
        accessToken
      );
    } else if (googleProfile) {
      googleUser = googleProfile;
    } else {
      throw new Error("Either accessToken or googleProfile must be provided");
    }

    let user = await this.usersRepository.findByEmail(googleUser.email);

    if (!user) {
      user = await this.usersRepository.create({
        name: googleUser.name,
        email: googleUser.email,
        avatar: googleUser.picture,
      });
    }

    const token = this.generateToken(user);

    return {
      user,
      token,
    };
  }

  private generateToken(user: User): string {
    const token = jwt.sign(
      {
        sub: user.id,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    return token;
  }
}
