import { useAuthContext } from "@/src/context/auth-context";

export function useAuth() {
  return useAuthContext();
}
