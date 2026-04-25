import { getAccessToken } from "@/src/lib/auth-session";

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

type InvalidParam = {
  name?: unknown;
  reason?: unknown;
};

function mapInvalidParamsToErrors(
  invalidParams: unknown,
): Record<string, string[]> | undefined {
  if (!Array.isArray(invalidParams)) {
    return undefined;
  }

  const normalized = invalidParams as InvalidParam[];
  const errors: Record<string, string[]> = {};

  for (const param of normalized) {
    const name = typeof param.name === "string" ? param.name : undefined;
    const reason = typeof param.reason === "string" ? param.reason : undefined;

    if (!name || !reason) {
      continue;
    }

    if (!errors[name]) {
      errors[name] = [];
    }

    errors[name].push(reason);
  }

  return Object.keys(errors).length > 0 ? errors : undefined;
}

async function readResponseBody(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  return null;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers ?? {});

  if (!headers.has("Content-Type") && !(options?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const accessToken = getAccessToken();
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const body = await readResponseBody(res);

  if (!res.ok) {
    const bodyObj = (body && typeof body === "object" ? body : {}) as Record<
      string,
      unknown
    >;

    const mappedErrors =
      mapInvalidParamsToErrors(bodyObj.invalid_params) ??
      (bodyObj.errors as Record<string, string[]> | undefined);

    throw new ApiError(
      typeof bodyObj.detail === "string"
        ? bodyObj.detail
        : typeof bodyObj.title === "string"
          ? bodyObj.title
          : "Erro desconhecido",
      res.status,
      mappedErrors,
    );
  }

  return body as T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export { apiFetch };
