import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { jwtDecode } from "jwt-decode";
import { UserRole } from "./lib/types";


// Rotas que são liberadas e não exigem login
const UNPROTECTED_ROUTES = ["/login", "/register", "/", "/api/auth"];

// Define a rota padrão após login
const DEFAULT_AUTH_REDIRECT = "/admin/dashboard";

// Rotas restritas que exigem papéis específicos.
// A rota é prefixada e os papéis são a lista de quem PODE acessá-la.
const ROLE_ROUTES: { [key: string]: UserRole[] } = {
  // Apenas o Admin global pode acessar o Super Admin Panel
  "/dashboard/admin/": [UserRole.ADMIN],

  // Apenas o Dono e o Admin podem gerenciar Profissionais e Serviços
  "/dashboard/management/": [UserRole.ESTABLISHMENT_OWNER, UserRole.ADMIN],
};

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Tenta obter o token
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  // Checa se o usuário está logado (token existe e contém o accessToken)
  const isLoggedIn = !!token && !!token.accessToken;
  const isUnprotectedRoute = UNPROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // --- Caso 1: Usuário já logado ---
  if (isLoggedIn) {
    // Se logado e tentando acessar login ou register
    if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
      return NextResponse.redirect(new URL(DEFAULT_AUTH_REDIRECT, request.url));
    }

    // --- 2. Autorização (RBAC) ---
    const accessToken = token.accessToken as string;
    let userRole: UserRole | undefined;

    try {
      // O bloco de decodificação deve estar dentro do 'isLoggedIn'
      const decodedToken = jwtDecode(accessToken) as { role: UserRole };
      userRole = decodedToken.role;
    } catch (e) {
      console.error("Token decoding failed:", e);
      // Se a decodificação falhar (token expirado ou corrompido), força o logout
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // 3. Verificar o RBAC (Roles)
    for (const routePrefix in ROLE_ROUTES) {
      if (pathname.startsWith(routePrefix)) {
        const requiredRoles = ROLE_ROUTES[routePrefix];

        if (!requiredRoles.includes(userRole as UserRole)) {
          // Acesso negado. Redireciona para o dashboard padrão
          return NextResponse.redirect(
            new URL(DEFAULT_AUTH_REDIRECT, request.url)
          );
        }
      }
    }

    // Passa a requisição adiante se logado e autorizado
    return NextResponse.next();
  }

  // --- Caso 2: Usuário não logado ---
  if (!isLoggedIn) {
    // Se a rota NÃO é pública (rota privada como /dashboard)
    if (!isUnprotectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Se a rota é pública e não está logado (e.g., /login, /), permite
    return NextResponse.next();
  }
}

// Configuração do matcher (mantida como solicitado)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth|api/.*).*)"],
};
