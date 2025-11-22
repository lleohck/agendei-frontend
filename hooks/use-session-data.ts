import { useSession } from "next-auth/react";

interface CustomSession {
  accessToken: string;
  tokenType: string;
}

export function useSessionData() {
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  // Tipagem básica para a sessão customizada
  const customSession = session as unknown as CustomSession | null;

  return {
    session: customSession,
    isAuthenticated,
    isLoading,
    accessToken: customSession?.accessToken,
  };
}
