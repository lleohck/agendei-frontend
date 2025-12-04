import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    tokenType?: string;
    user?: {
      email?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    accessToken: string;
    tokenType: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    tokenType?: string;
    email?: string;
  }
}
