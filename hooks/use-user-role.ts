import { useSession } from "next-auth/react";
import { jwtDecode } from "jwt-decode";
import { UserRole } from "@/lib/types";

interface DecodedToken {
  role: UserRole;
}

export function useUserRole() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  let userRole = UserRole.GUEST;
  const accessToken = session?.accessToken as string | undefined; // Captura o accessToken

  if (!isAuthenticated || !accessToken) {
    // Retorna GUEST e accessToken indefinido
    return { userRole, isAuthenticated, isLoading, accessToken: undefined };
  }

  try {
    // Decodifica o token para obter o papel
    const decoded = jwtDecode(accessToken) as DecodedToken;
    userRole = decoded.role;

    // Retorna o papel do usuário E o accessToken
    return { userRole, isAuthenticated, isLoading, accessToken };
  } catch (e) {
    console.error("Failed to decode token on frontend:", e);
    // Se falhar na decodificação, retorna GUEST e token indefinido
    return {
      userRole: UserRole.GUEST,
      isAuthenticated,
      isLoading,
      accessToken: undefined,
    };
  }
}
