import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { api } from "@/lib/api"
import axios from "axios"

// Este é o token retornado pelo FastAPI
interface FastApiToken {
  access_token: string
  token_type: string
}

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // 1. Chama o endpoint de login do FastAPI
        try {
          const response = await api.post<FastApiToken>("/token", new URLSearchParams({
            username: credentials.email as string,
            password: credentials.password as string,
          }), {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          })

          const tokenData = response.data
          
          // 2. Aqui, usamos o token do FastAPI como o objeto 'user' do NextAuth
          if (tokenData.access_token) {
            // O objeto retornado aqui é armazenado no JWT do NextAuth
            return {
              id: "jwt_user_id", // ID Fixo ou o ID do user se você o retornasse do FastAPI
              tokenType: tokenData.token_type,
              accessToken: tokenData.access_token,
              email: credentials.email as string,
            }
          }
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            return null
          }
          console.error("Login API Error:", error)
          throw new Error("Login failed due to server error.")
        }
        return null
      },
    }),
  ],
  // Configura a estratégia de sessão para usar JWT
  session: {
    strategy: "jwt",
  },
  // Define a página de login customizada
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // 3. Atualiza o JWT do NextAuth com o accessToken do FastAPI
    jwt: async ({ token, user }) => {
      if (user) {
        token.accessToken = (user as any).accessToken
        token.tokenType = (user as any).tokenType
        token.email = (user as any).email
      }
      return token
    },
    // 4. Expõe o token na sessão para ser acessível pelos componentes
    session: async ({ session, token }) => {
      if (token.accessToken) {
        session.accessToken = token.accessToken as string
        session.tokenType = token.tokenType as string
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }