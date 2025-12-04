import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { api } from "@/lib/api";
import axios from "axios";

interface FastApiToken {
  access_token: string;
  token_type: string;
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const response = await api.post<FastApiToken>(
            "/token",
            new URLSearchParams({
              username: credentials?.email ?? "",
              password: credentials?.password ?? "",
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
          );

          const tokenData = response.data;

          if (tokenData.access_token) {
            // O objeto `user` retorna para o callback jwt
            return {
              id: "jwt_user_id",
              email: credentials?.email ?? "",
              accessToken: tokenData.access_token,
              tokenType: tokenData.token_type,
            };
          }

          return null;
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            return null;
          }
          console.error("Login API Error:", error);
          throw new Error("Login failed due to server error.");
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    // ---- JWT CALLBACK ----
    jwt: async ({ token, user }) => {
      if (user) {
        token.accessToken = user.accessToken;
        token.tokenType = user.tokenType;
        token.email = user.email;
      }
      return token;
    },

    // ---- SESSION CALLBACK ----
    session: async ({ session, token }) => {
      session.accessToken = token.accessToken;
      session.tokenType = token.tokenType;

      if (session.user) {
        session.user.email = token.email;
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
