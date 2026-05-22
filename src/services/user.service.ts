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
  isDefault?: boolean;
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
  Addresses?: UserAddress[];
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

export type AddressCreateBody = {
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  makeDefault?: boolean;
};

export type AddressUpdateBody = {
  street?: string;
  number?: string;
  complement?: string | null;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
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

async function createAddress(
  userId: string,
  data: AddressCreateBody,
): Promise<UserAddress> {
  const response = await apiFetch<ApiResponse<UserAddress>>(
    `/users/${userId}/address`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );

  return response.data;
}

async function updateAddress(
  userId: string,
  addressId: string,
  data: AddressUpdateBody,
): Promise<UserAddress> {
  const response = await apiFetch<ApiResponse<UserAddress>>(
    `/users/${userId}/address/${addressId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );

  return response.data;
}

async function setDefaultAddress(
  userId: string,
  addressId: string,
): Promise<UserAddress> {
  const response = await apiFetch<ApiResponse<UserAddress>>(
    `/users/${userId}/address/${addressId}/default`,
    {
      method: "PATCH",
    },
  );

  return response.data;
}

async function deleteAddress(
  userId: string,
  addressId: string,
): Promise<void> {
  await apiFetch<{ message: string }>(`/users/${userId}/address/${addressId}`, {
    method: "DELETE",
  });
}

export const userService = {
  create,
  getMe,
  updateMe,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
  // wishlist endpoints
  async getUserWishlist(userId: string) {
    const response = await apiFetch<ApiResponse<any>>(
      `/users/${userId}/wishlist`,
      {
        method: "GET",
      },
    );

    return response.data;
  },

  async addBookToWishlist(userId: string, bookId: string) {
    const response = await apiFetch<ApiResponse<any>>(
      `/users/${userId}/wishlist/${bookId}`,
      {
        method: "POST",
      },
    );

    return response.data;
  },

  async removeBookFromWishlist(userId: string, bookId: string) {
    const response = await apiFetch<ApiResponse<any>>(
      `/users/${userId}/wishlist/${bookId}`,
      {
        method: "DELETE",
      },
    );

    return response.data;
  },
};
