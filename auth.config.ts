import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { loginSchema } from "@/lib/validators/login.schema"
import { buscarUsuarioPorEmail } from "@/services/usuario.service"
import { verifyPassword } from "@/lib/password"

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const usuario = await buscarUsuarioPorEmail(email)
        if (!usuario || !usuario.passwordHash) return null

        if (usuario.estadoCuenta !== "ACTIVO") return null

        const passwordValido = await verifyPassword(password, usuario.passwordHash)
        if (!passwordValido) return null

        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nombre,
          rolPrincipal: usuario.rolPrincipal,
          estadoVendedor: usuario.estadoVendedor,
          estadoCuenta: usuario.estadoCuenta,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.rolPrincipal = (user as any).rolPrincipal
        token.estadoVendedor = (user as any).estadoVendedor
        token.estadoCuenta = (user as any).estadoCuenta
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.rolPrincipal = token.rolPrincipal as any
        session.user.estadoVendedor = token.estadoVendedor as any
        session.user.estadoCuenta = token.estadoCuenta as any
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: { strategy: "jwt" },
}
