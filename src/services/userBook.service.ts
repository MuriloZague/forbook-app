import { apiFetch } from "./api";

type ApiResponse<T> = {
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type UserBookCondition =
  | "NEW"
  | "LIKE_NEW"
  | "GOOD"
  | "ACCEPTABLE"
  | "POOR";

export type UserBookStatus = "ACTIVE" | "INACTIVE";

export type ImageAsset = {
  id: string;
  url: string;
};

export type CatalogBook = {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  description: string;
};

export type UserBook = {
  id: string;
  condition: UserBookCondition;
  price: number;
  description: string;
  status: UserBookStatus;
  isPrivate: boolean;
  MainImage: ImageAsset;
  GalleryImages: ImageAsset[];
  CatalogBook: CatalogBook;
  User: {
    id: string;
    name: string;
    ProfileImage?: ImageAsset | null;
  };
};

export type CatalogBookCreateBody = Omit<CatalogBook, "id">;

export type UserBookCreateBody = {
  condition: UserBookCondition;
  price: number;
  description: string;
  status: UserBookStatus;
  catalogBook: CatalogBookCreateBody;
  mainImageId: string;
  galleryImages?: string[];
};

async function listUserBooks(): Promise<UserBook[]> {
  const response = await apiFetch<ApiResponse<UserBook[]>>("/user-books", {
    method: "GET",
  });

  return response.data;
}

async function listMyUserBooks(): Promise<UserBook[]> {
  const response = await apiFetch<ApiResponse<UserBook[]>>("/user-books/my", {
    method: "GET",
  });

  return response.data;
}

async function createUserBook(body: UserBookCreateBody): Promise<UserBook> {
  const response = await apiFetch<ApiResponse<UserBook>>("/user-books", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return response.data;
}

async function getUserBookById(id: string): Promise<UserBook> {
  const response = await apiFetch<ApiResponse<UserBook>>(`/user-books/${id}`);

  return response.data;
}

export const userBookService = {
  listUserBooks,
  listMyUserBooks,
  createUserBook,
  getUserBookById,
};
