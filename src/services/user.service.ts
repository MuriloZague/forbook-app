import type { UserCreateBody } from "../schemas/user.schema";
import { apiFetch } from "./api";

type ApiResponse<T> = {
  message: string;
  data: T;
};

type ProfileImage = {
  id: string;
  url: string;
};

export type UserAddress = {
  id: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
};

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  cpf: string;
  birthDate: string;
  isEmailVerified: boolean;
  isReceiveTwoFactorAuthEmail: boolean;
  createdAt: string;
  updatedAt: string;
  ProfileImage?: ProfileImage | null;
  Address?: UserAddress[];
};

export type UserUpdateBody = {
  name?: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: string;
  profileImageId?: string;
  address?: {
    street: string;
    number: string;
    complement: string | null;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
};

async function create(data: UserCreateBody) {
  return apiFetch<{ message: string }>("/users/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function getMe(): Promise<UserProfile> {
  const response = await apiFetch<ApiResponse<UserProfile>>("/users/me", {
    method: "GET",
  });

  return response.data;
}

async function updateMe(data: UserUpdateBody): Promise<UserProfile> {
  const response = await apiFetch<ApiResponse<UserProfile>>("/users/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });

  return response.data;
}

export const userService = {
  create,
  getMe,
  updateMe,
};
