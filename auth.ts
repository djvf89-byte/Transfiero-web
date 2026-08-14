import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from "./auth.config"

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
  callbacks: {
    jwt: authConfig.callbacks!.jwt!,
    // Siempre lee rolPrincipal/estadoVendedor/estadoCuenta frescos desde BD
    // para que cambios del admin se reflejen en el próximo request sin logout.
    async session({ session, token }) {
      session.user.id = token.id as string
      if (token.id) {
        const usuario = await prisma.usuario.findUnique({
          where: { id: token.id as string },
          select: { rolPrincipal: true, estadoVendedor: true, estadoCuenta: true },
        })
        if (usuario) {
          session.user.rolPrincipal = usuario.rolPrincipal
          session.user.estadoVendedor = usuario.estadoVendedor
          session.user.estadoCuenta = usuario.estadoCuenta
        } else {
          session.user.rolPrincipal = token.rolPrincipal as any
          session.user.estadoVendedor = token.estadoVendedor as any
          session.user.estadoCuenta = token.estadoCuenta as any
        }
      }
      return session
    },
  },
})
