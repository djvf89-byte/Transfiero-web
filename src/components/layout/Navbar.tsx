import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"

export async function Navbar() {
  const session = await auth()
  const user = session?.user

  const esVendedor = user?.rolPrincipal === "VENDEDOR" && user?.estadoVendedor === "APROBADO"
  const esAdmin = user?.rolPrincipal === "ADMINISTRADOR"

  let notifSinLeer = 0
  if (user) {
    notifSinLeer = await prisma.notificacion.count({
      where: { usuarioId: user.id, leida: false },
    })
  }

  const iniciales = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?"

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#05091A]/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/logo-dark.png"
              alt="Transfiero"
              width={160}
              height={40}
              className="h-11 w-auto"
              priority
            />
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-white/50 hover:bg-white/6 hover:text-white transition-colors"
            >
              Marketplace
            </Link>
            {user && (
              <Link
                href="/mis-compras"
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/50 hover:bg-white/6 hover:text-white transition-colors"
              >
                Mis Compras
              </Link>
            )}
            {esVendedor && (
              <>
                <Link
                  href="/mis-ventas"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-white/50 hover:bg-white/6 hover:text-white transition-colors"
                >
                  Mis Ventas
                </Link>
                <Link
                  href="/mis-publicaciones"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-white/50 hover:bg-white/6 hover:text-white transition-colors"
                >
                  Mis Publicaciones
                </Link>
              </>
            )}
            {esAdmin && (
              <>
                <Link href="/admin/publicaciones" className="rounded-lg px-3 py-2 text-sm font-medium text-amber-400 hover:bg-white/6 transition-colors">
                  Publicaciones
                </Link>
                <Link href="/admin/vendedores" className="rounded-lg px-3 py-2 text-sm font-medium text-amber-400 hover:bg-white/6 transition-colors">
                  Vendedores
                </Link>
                <Link href="/admin/operaciones" className="rounded-lg px-3 py-2 text-sm font-medium text-amber-400 hover:bg-white/6 transition-colors">
                  Operaciones
                </Link>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!user ? (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-white/50 hover:text-white transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/auth/registro"
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-gray-900 hover:bg-amber-400 transition-colors shadow-[0_0_16px_rgba(245,158,11,0.25)]"
                >
                  Registrarse gratis
                </Link>
              </>
            ) : (
              <>
                {esVendedor && (
                  <Link
                    href="/mis-publicaciones/nueva"
                    className="hidden sm:flex rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-gray-900 hover:bg-amber-400 transition-colors items-center gap-1.5 shadow-[0_0_16px_rgba(245,158,11,0.25)]"
                  >
                    <span>+</span> Publicar entrada
                  </Link>
                )}
                {/* Notificaciones */}
                <Link href="/notificaciones" className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-white text-sm hover:bg-white/12 transition-colors">
                    🔔
                  </div>
                  {notifSinLeer > 0 && (
                    <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-gray-900">
                      {notifSinLeer > 9 ? "9+" : notifSinLeer}
                    </div>
                  )}
                </Link>
                {/* Avatar */}
                <Link href="/perfil" className="flex items-center gap-2 rounded-lg bg-white/6 px-3 py-1.5 hover:bg-white/10 transition-colors">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    {iniciales}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-white max-w-[100px] truncate">
                    {user.name?.split(" ")[0]}
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
