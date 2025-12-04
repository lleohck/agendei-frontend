import { useSession } from "next-auth/react";
import { jwtDecode } from "jwt-decode";

export enum UserRole {
  ADMIN = "ADMIN",
  ESTABLISHMENT_OWNER = "ESTABLISHMENT_OWNER",
  PROFESSIONAL = "PROFESSIONAL",
  CLIENT = "CLIENT",
  GUEST = "GUEST",
}

interface DecodedToken {
  role: UserRole;
  establishment_id: string;
}

interface UseUserRoleResult {
  userRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string;
  establishmentId: string;
}

export function useUserRole(): UseUserRoleResult {
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const accessToken = session?.accessToken ?? "";
  let userRole = UserRole.GUEST;
  let establishmentId = "";

  if (!isAuthenticated || !accessToken) {
    return {
      userRole,
      isAuthenticated,
      isLoading,
      accessToken: "",
      establishmentId: "",
    };
  }

  try {
    const decoded = jwtDecode<DecodedToken>(accessToken);
    userRole = decoded.role;
    establishmentId = decoded.establishment_id;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
  }

  return {
    userRole,
    isAuthenticated,
    isLoading,
    accessToken,
    establishmentId,
  };
}
