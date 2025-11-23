import { useSession } from "next-auth/react";
import { jwtDecode } from "jwt-decode";

enum UserRole {
  ADMIN = "ADMIN",
  ESTABLISHMENT_OWNER = "ESTABLISHMENT_OWNER",
  PROFESSIONAL = "PROFESSIONAL",
  CLIENT = "CLIENT",
  GUEST = "GUEST",
}

interface DecodedToken {
  role: UserRole;
  establishment_id?: number;
}

export function useUserRole() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  let userRole = UserRole.GUEST;
  const accessToken = session?.accessToken as string | undefined;
  let establishmentId: number | undefined;

  if (!isAuthenticated || !accessToken) {
    return {
      userRole,
      isAuthenticated,
      isLoading,
      accessToken: undefined,
      establishmentId: undefined,
    };
  }

  try {
    const decoded = jwtDecode(accessToken) as DecodedToken;
    userRole = decoded.role;
    establishmentId = decoded.establishment_id;

    return {
      userRole,
      isAuthenticated,
      isLoading,
      accessToken,
      establishmentId,
    };
  } catch (e) {
    console.error("Failed to decode token on frontend:", e);
    return {
      userRole: UserRole.GUEST,
      isAuthenticated,
      isLoading,
      accessToken: undefined,
      establishmentId: undefined,
    };
  }
}
