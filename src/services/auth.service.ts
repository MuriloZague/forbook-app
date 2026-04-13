import type { ConfirmLoginBody, LoginBody } from "../schemas/auth.schema";
import { apiFetch } from "./api";

export const authService = {
    async login(data: LoginBody) {
        return apiFetch<{ message: string }>("/auth/login", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    async confirmLogin(data: ConfirmLoginBody) {
        return apiFetch<{ message: string; data: { accessToken: string; refreshToken: string } }>("/auth/confirm-login", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
};
