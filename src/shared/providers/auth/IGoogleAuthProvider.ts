import { GoogleUser } from "../../../domain/entities/GoogleUser.js";

export interface IGoogleAuthProvider {
  getTokensAndProfile(code: string): Promise<{
    tokens: {
      id_token?: string | null;
      access_token?: string | null;
      refresh_token?: string | null;
    };
    profile: GoogleUser;
  }>;
  validateAccessToken(accessToken: string): Promise<GoogleUser>;
}
