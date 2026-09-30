import { auth } from "@/lib/auth"
import { NextResponse, type NextRequest } from "next/server"
import type { Session } from "next-auth"

// Rutas que requieren sesión activa
const RUTAS_PROTEGIDAS = [
  "/dashboard",
  "/mis-compras",
  "/mis-ventas",
  "/mis-publicaciones",
  "/admin",
  "/perfil",
]

const RUTAS_AUTH = ["/auth/login", "/auth/registro"]

type AuthRequest = NextRequest & { auth: Session | null }

export const runtime = "nodejs"

export default auth((req: AuthRequest) => {
  const { nextUrl } = req
  const session = req.auth
  const pathname = nextUrl.pathname

  const esAuth = RUTAS_AUTH.some((r) => pathname.startsWith(r))
  const esProtegida = RUTAS_PROTEGIDAS.some((r) => pathname.startsWith(r))

  if (esAuth) {
    if (session) return NextResponse.redirect(new URL("/dashboard", nextUrl))
    return NextResponse.next()
  }

  if (esProtegida && !session) {
    const loginUrl = new URL("/auth/login", nextUrl)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (!session) return NextResponse.next()

  const { rolPrincipal, estadoVendedor, estadoCuenta } = session.user

  if (estadoCuenta !== "ACTIVO") {
    return NextResponse.redirect(new URL("/auth/login", nextUrl))
  }

  if (pathname.startsWith("/admin")) {
    if (rolPrincipal !== "ADMINISTRADOR") {
      return NextResponse.redirect(new URL("/403", nextUrl))
    }
  }

  if (pathname.startsWith("/mis-publicaciones")) {
    if (rolPrincipal !== "VENDEDOR" || estadoVendedor !== "APROBADO") {
      return NextResponse.redirect(new URL("/403", nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
