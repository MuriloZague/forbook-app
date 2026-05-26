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

type ListUserBooksParams = {
  filter?: Record<string, unknown>;
  page?: number;
  limit?: number;
  sort?: Record<string, unknown>;
};

function buildQueryString(params?: ListUserBooksParams): string {
  if (!params) {
    return "";
  }

  const query = new URLSearchParams();

  if (params.filter && Object.keys(params.filter).length > 0) {
    query.set("filter", JSON.stringify(params.filter));
  }

  if (typeof params.page === "number") {
    query.set("page", String(params.page));
  }

  if (typeof params.limit === "number") {
    query.set("limit", String(params.limit));
  }

  if (params.sort && Object.keys(params.sort).length > 0) {
    query.set("sort", JSON.stringify(params.sort));
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

async function listUserBooks(params?: ListUserBooksParams): Promise<UserBook[]> {
  const response = await apiFetch<ApiResponse<UserBook[]>>(
    `/user-books${buildQueryString(params)}`,
    {
      method: "GET",
    },
  );

  return response.data;
}

async function listMyUserBooks(
  params?: ListUserBooksParams,
): Promise<UserBook[]> {
  const response = await apiFetch<ApiResponse<UserBook[]>>(
    `/user-books/my${buildQueryString(params)}`,
    {
      method: "GET",
    },
  );

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

export async function listUserBooksWithMeta(
  params?: ListUserBooksParams,
): Promise<{ data: UserBook[]; meta?: ApiResponse<UserBook[]>["meta"] }> {
  const response = await apiFetch<ApiResponse<UserBook[]>>(
    `/user-books${buildQueryString(params)}`,
    {
      method: "GET",
    },
  );

  return { data: response.data, meta: response.meta };
}

export async function listMyUserBooksWithMeta(
  params?: ListUserBooksParams,
): Promise<{ data: UserBook[]; meta?: ApiResponse<UserBook[]>["meta"] }> {
  const response = await apiFetch<ApiResponse<UserBook[]>>(
    `/user-books/my${buildQueryString(params)}`,
    {
      method: "GET",
    },
  );

  return { data: response.data, meta: response.meta };
}
