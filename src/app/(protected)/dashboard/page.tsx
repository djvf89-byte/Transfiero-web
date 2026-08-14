import { auth } from "@/lib/auth"
import Link from "next/link"

const ROL_LABEL: Record<string, string> = {
  ADMINISTRADOR: "Administrador",
  VENDEDOR: "Vendedor verificado",
  COMPRADOR: "Comprador",
}

const ROL_BADGE: Record<string, string> = {
  ADMINISTRADOR: "border border-violet-500/30 bg-violet-500/10 text-violet-400",
  VENDEDOR: "border border-amber-500/30 bg-amber-500/10 text-amber-400",
  COMPRADOR: "border border-blue-500/30 bg-blue-500/10 text-blue-400",
}

export default async function DashboardPage() {
  const session = await auth()
  const user = session!.user
  const nombre = user.name?.split(" ")[0] ?? "usuario"
  const rol = user.rolPrincipal ?? "COMPRADOR"
  const esVendedor = rol === "VENDEDOR" && user.estadoVendedor === "APROBADO"
  const esAdmin = rol === "ADMINISTRADOR"

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">

      {/* Bienvenida */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] px-8 py-7 backdrop-blur-sm">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${ROL_BADGE[rol]}`}>
          {ROL_LABEL[rol]}
        </span>
        <h1 className="mt-3 text-2xl font-extrabold text-white">
          Bienvenido, {nombre}
        </h1>
        <p className="mt-1 text-sm text-white/40">
          ¿Qué quieres hacer hoy?
        </p>
      </div>

      {/* COMPRADOR */}
      {!esVendedor && !esAdmin && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href="/" className="group rounded-2xl border border-white/8 bg-white/[0.04] p-6 transition hover:border-amber-500/30 hover:bg-white/[0.07]">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-xl">
              🎟
            </div>
            <p className="font-bold text-white">Marketplace</p>
            <p className="mt-1 text-sm text-white/45">Explora y reserva entradas disponibles</p>
            <p className="mt-3 text-xs font-semibold text-amber-400 group-hover:underline">Explorar →</p>
          </Link>

          <Link href="/mis-compras" className="group rounded-2xl border border-white/8 bg-white/[0.04] p-6 transition hover:border-white/15 hover:bg-white/[0.07]">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/8 text-xl">
              📦
            </div>
            <p className="font-bold text-white">Mis Compras</p>
            <p className="mt-1 text-sm text-white/45">Seguimiento de tus operaciones activas</p>
            <p className="mt-3 text-xs font-semibold text-white/50 group-hover:text-white group-hover:underline transition-colors">Ver compras →</p>
          </Link>

          <Link href="/perfil/verificacion" className="group rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 transition hover:border-amber-500/30 hover:bg-white/[0.06] sm:col-span-2">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/8 text-xl">
                ✅
              </div>
              <div>
                <p className="font-bold text-white">¿Quieres vender entradas?</p>
                <p className="text-sm text-white/45">Verifica tu identidad en menos de 2 minutos y empieza a publicar</p>
              </div>
              <span className="ml-auto shrink-0 text-xs font-semibold text-amber-400 group-hover:underline">Solicitar →</span>
            </div>
          </Link>
        </div>
      )}

      {/* VENDEDOR */}
      {esVendedor && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href="/mis-publicaciones/nueva" className="group rounded-2xl border border-amber-500/25 bg-amber-500/8 p-6 transition hover:bg-amber-500/12 sm:col-span-2">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-xl">
                ➕
              </div>
              <div>
                <p className="font-bold text-white">Publicar nueva entrada</p>
                <p className="text-sm text-white/50">Sube tu entrada y llega a compradores verificados</p>
              </div>
              <span className="ml-auto shrink-0 text-xs font-semibold text-amber-400 group-hover:underline">Publicar →</span>
            </div>
          </Link>

          <Link href="/mis-ventas" className="group rounded-2xl border border-white/8 bg-white/[0.04] p-6 transition hover:border-white/15 hover:bg-white/[0.07]">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/8 text-xl">
              💰
            </div>
            <p className="font-bold text-white">Mis Ventas</p>
            <p className="mt-1 text-sm text-white/45">Reservas recibidas y operaciones activas</p>
            <p className="mt-3 text-xs font-semibold text-white/50 group-hover:text-white group-hover:underline transition-colors">Ver ventas →</p>
          </Link>

          <Link href="/mis-publicaciones" className="group rounded-2xl border border-white/8 bg-white/[0.04] p-6 transition hover:border-white/15 hover:bg-white/[0.07]">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/8 text-xl">
              📋
            </div>
            <p className="font-bold text-white">Mis Publicaciones</p>
            <p className="mt-1 text-sm text-white/45">Gestiona tus entradas publicadas</p>
            <p className="mt-3 text-xs font-semibold text-white/50 group-hover:text-white group-hover:underline transition-colors">Ver publicaciones →</p>
          </Link>

          <Link href="/" className="group rounded-2xl border border-white/8 bg-white/[0.04] p-6 transition hover:border-amber-500/30 hover:bg-white/[0.07]">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-xl">
              🎟
            </div>
            <p className="font-bold text-white">Marketplace</p>
            <p className="mt-1 text-sm text-white/45">Explora también como comprador</p>
            <p className="mt-3 text-xs font-semibold text-amber-400 group-hover:underline">Explorar →</p>
          </Link>

          <Link href="/mis-compras" className="group rounded-2xl border border-white/8 bg-white/[0.04] p-6 transition hover:border-white/15 hover:bg-white/[0.07]">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/8 text-xl">
              📦
            </div>
            <p className="font-bold text-white">Mis Compras</p>
            <p className="mt-1 text-sm text-white/45">Entradas que has reservado</p>
            <p className="mt-3 text-xs font-semibold text-white/50 group-hover:text-white group-hover:underline transition-colors">Ver compras →</p>
          </Link>
        </div>
      )}

      {/* ADMINISTRADOR */}
      {esAdmin && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href="/admin" className="group rounded-2xl border border-violet-500/25 bg-violet-500/8 p-6 transition hover:bg-violet-500/12 sm:col-span-2">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-xl">
                🛡️
              </div>
              <div>
                <p className="font-bold text-white">Panel de Administración</p>
                <p className="text-sm text-white/50">Dashboard operativo, publicaciones, vendedores, operaciones y usuarios</p>
              </div>
              <span className="ml-auto shrink-0 text-xs font-semibold text-amber-400 group-hover:underline">Ir al panel →</span>
            </div>
          </Link>

          <Link href="/admin/publicaciones" className="group rounded-2xl border border-white/8 bg-white/[0.04] p-6 transition hover:border-white/15 hover:bg-white/[0.07]">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-xl">
              📋
            </div>
            <p className="font-bold text-white">Publicaciones</p>
            <p className="mt-1 text-sm text-white/45">Revisar y aprobar entradas pendientes</p>
            <p className="mt-3 text-xs font-semibold text-white/50 group-hover:text-white group-hover:underline transition-colors">Gestionar →</p>
          </Link>

          <Link href="/admin/operaciones" className="group rounded-2xl border border-white/8 bg-white/[0.04] p-6 transition hover:border-white/15 hover:bg-white/[0.07]">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/15 text-xl">
              💳
            </div>
            <p className="font-bold text-white">Operaciones</p>
            <p className="mt-1 text-sm text-white/45">Confirmar pagos y liberar fondos</p>
            <p className="mt-3 text-xs font-semibold text-white/50 group-hover:text-white group-hover:underline transition-colors">Gestionar →</p>
          </Link>
        </div>
      )}
    </div>
  )
}
