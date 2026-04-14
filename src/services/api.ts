const API_URL = process.env.EXPO_PUBLIC_API_URL!;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });

    const body = await res.json();

    if (!res.ok) {
        throw new ApiError(body.title ?? "Erro desconhecido", res.status, body.errors);
    }

    return body;
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
