import type { UserCreateBody } from "../schemas/user.schema";
import { apiFetch } from "./api";

export const userService = {
  async create(data: UserCreateBody) {
    return apiFetch<{ message: string }>("/users/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
