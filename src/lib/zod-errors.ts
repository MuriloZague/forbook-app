import type { ZodError } from "zod";

export function extractErrors(error: ZodError): Record<string, string> {
    const result: Record<string, string> = {};

    for (const issue of error.issues) {
        // For nested paths like "address.street" -> use "street" as the key
        const key = (issue.path as string[]).length > 1
            ? (issue.path[1] as string) ?? "root"
            : (issue.path[0] as string) ?? "root";

        if (!result[key]) {
            result[key] = issue.message;
        }
    }

    return result;
}

export function apiFieldErrors(errors: Record<string, string[]>): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [key, messages] of Object.entries(errors)) {
        result[key] = messages[0] ?? "Campo inválido";
    }

    return result;
}
