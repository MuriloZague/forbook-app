import type { ConfirmLoginBody, LoginBody } from "../schemas/auth.schema";
import { apiFetch } from "./api";

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

type LoginWithCode = {
  userId: string;
  isEmailVerified: boolean;
  isReceiveTwoFactorAuthEmail: boolean;
};

type ApiResponse<T> = {
  message: string;
  data: T;
};

export type LoginResult = LoginWithCode | TokenPair;

export function isTokenPair(result: LoginResult): result is TokenPair {
  return (
    typeof result === "object" &&
    result !== null &&
    "accessToken" in result &&
    "refreshToken" in result
  );
}

export const authService = {
  async login(data: LoginBody) {
    return apiFetch<ApiResponse<LoginResult>>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async confirmLogin(data: ConfirmLoginBody) {
    return apiFetch<ApiResponse<TokenPair>>("/auth/confirm-login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
