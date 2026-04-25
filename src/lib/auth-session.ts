import type { AuthSession } from "./session-storage";

let activeSession: AuthSession | null = null;

export function setActiveSession(session: AuthSession | null): void {
  activeSession = session;
}

export function getActiveSession(): AuthSession | null {
  return activeSession;
}

export function getAccessToken(): string | null {
  return activeSession?.accessToken ?? null;
}
