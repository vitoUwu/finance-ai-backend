import { OAuth2Client } from "google-auth-library";
import { IGoogleAuthProvider } from "../IGoogleAuthProvider.js";
import { GoogleUser } from "../../../../domain/entities/GoogleUser.js";
import { UnauthorizedError } from "../../../errors/AppError.js";
import { LoggerService } from "../../../services/LoggerService.js";

export class GoogleAuthProvider implements IGoogleAuthProvider {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );
  }

  async getTokensAndProfile(code: string) {
    try {
      const { tokens } = await this.client.getToken(code);
      const ticket = await this.client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedError("Invalid token");
      }

      return {
        tokens,
        profile: {
          id: payload.sub,
          email: payload.email!,
          name: payload.name!,
          picture: payload.picture!,
          locale: payload.locale!,
        },
      };
    } catch (error) {
      LoggerService.error({
        message: "Error getting tokens and profile",
        error: error as Error,
      });
      throw new UnauthorizedError("Failed to authenticate with Google");
    }
  }

  async validateAccessToken(accessToken: string): Promise<GoogleUser> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error("Failed to get user info");
      }

      const data = await response.json();

      return {
        id: data.sub,
        email: data.email,
        name: data.name,
        picture: data.picture,
        locale: data.locale,
      };
    } catch (error) {
      LoggerService.error({
        message: "Error validating access token",
        error: error as Error,
      });
      throw new UnauthorizedError("Invalid token");
    }
  }
}
