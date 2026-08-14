import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { listarOperacionesVendedor, obtenerResumenVendedor } from "@/services/operacion.service"
import { EstadoBadge } from "@/components/operaciones/EstadoBadge"

function formatFecha(fecha: Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(fecha))
}

const GRADIENTE_CATEGORIA: Record<string, string> = {
  CONCIERTO: "from-blue-950 to-blue-900",
  DEPORTE: "from-green-950 to-teal-900",
  FESTIVAL: "from-purple-950 to-pink-900",
  TEATRO: "from-amber-950 to-orange-900",
  OTRO: "from-slate-900 to-slate-700",
}
const ICONO_CATEGORIA: Record<string, string> = {
  CONCIERTO: "🎵",
  DEPORTE: "⚽",
  FESTIVAL: "🎪",
  TEATRO: "🎭",
  OTRO: "🎟",
}

export default async function MisVentasPage() {
  const session = await auth()
  if (
    session!.user.rolPrincipal !== "VENDEDOR" ||
    session!.user.estadoVendedor !== "APROBADO"
  ) {
    redirect("/403")
  }

  const [{ operaciones }, resumen] = await Promise.all([
    listarOperacionesVendedor(session!.user.id),
    obtenerResumenVendedor(session!.user.id),
  ])

  const urgentes = operaciones.filter((op) => op.estado === "ESPERANDO_VENDEDOR")
  const resto = operaciones.filter((op) => op.estado !== "ESPERANDO_VENDEDOR")

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Mis Ventas</h1>
          <p className="mt-1 text-sm text-white/40">Reservas recibidas y operaciones activas</p>
        </div>
        <Link
          href="/mis-publicaciones/nueva"
          className="rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 px-4 py-2 text-sm font-bold text-gray-900 hover:opacity-90 transition-opacity shadow-[0_4px_16px_rgba(245,158,11,0.3)]"
        >
          + Publicar entrada
        </Link>
      </div>

      {/* Métricas */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/8 bg-white/[0.04] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/30">Activas</p>
          <p className="mt-1 text-2xl font-extrabold text-white">{resumen.activas}</p>
          {urgentes.length > 0 && (
            <p className="mt-0.5 text-xs font-semibold text-amber-400">
              {urgentes.length} requieren acción
            </p>
          )}
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.04] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/30">En custodia</p>
          <p className="mt-1 text-2xl font-extrabold text-amber-400">
            S/ {(resumen.enCustodiaCentimos / 100).toFixed(0)}
          </p>
          <p className="mt-0.5 text-xs text-white/30">Pendiente de liberar</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.04] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/30">Completadas</p>
          <p className="mt-1 text-2xl font-extrabold text-green-400">{resumen.completadas}</p>
          <p className="mt-0.5 text-xs text-white/30">Fondos liberados</p>
        </div>
      </div>

      {/* Urgentes */}
      {urgentes.length > 0 && (
        <div className="mb-5">
          <p className="mb-2 text-sm font-bold text-amber-400">⚡ Requieren tu respuesta</p>
          <div className="space-y-2">
            {urgentes.map((op) => {
              const gradiente = GRADIENTE_CATEGORIA[op.publicacion.categoria] ?? GRADIENTE_CATEGORIA.OTRO
              const icono = ICONO_CATEGORIA[op.publicacion.categoria] ?? "🎟"
              const expiraEn = new Date(op.reservaExpiraEn).getTime() - Date.now()
              const minutos = Math.max(0, Math.floor(expiraEn / 60000))
              const segundos = Math.max(0, Math.floor((expiraEn % 60000) / 1000))

              return (
                <Link
                  key={op.id}
                  href={`/mis-ventas/${op.id}`}
                  className="flex items-center gap-4 rounded-xl border border-amber-500/25 bg-amber-500/8 p-4 hover:bg-amber-500/12 transition-colors"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradiente} text-xl`}>
                    {icono}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-bold text-white text-sm">
                      {op.publicacion.nombreEvento}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {op.publicacion.zona} · Comprador: {op.comprador.nombre.split(" ")[0]}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-amber-400">
                      ⏱ {minutos}:{segundos.toString().padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-white/70">
                      +S/ {(op.montoVendedorCentimos / 100).toFixed(2)}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Historial */}
      {resto.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-white/40">Historial</p>
          <div className="space-y-2">
            {resto.map((op) => {
              const gradiente = GRADIENTE_CATEGORIA[op.publicacion.categoria] ?? GRADIENTE_CATEGORIA.OTRO
              const icono = ICONO_CATEGORIA[op.publicacion.categoria] ?? "🎟"

              return (
                <Link
                  key={op.id}
                  href={`/mis-ventas/${op.id}`}
                  className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/[0.04] p-4 transition hover:border-white/15 hover:bg-white/[0.07]"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradiente} text-xl`}>
                    {icono}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-bold text-white text-sm">
                      {op.publicacion.nombreEvento}
                    </p>
                    <p className="text-xs text-white/35 mt-0.5">
                      📅 {formatFecha(op.publicacion.fechaEvento)}
                    </p>
                    <div className="mt-1">
                      <EstadoBadge estado={op.estado} vista="vendedor" />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-extrabold text-base ${op.estado === "FONDOS_LIBERADOS" ? "text-green-400" : "text-white"}`}>
                      {op.estado === "FONDOS_LIBERADOS" ? "+" : ""}S/ {(op.montoVendedorCentimos / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">{formatFecha(op.creadoEn)}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {operaciones.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] py-16 text-center">
          <p className="text-3xl mb-3">💰</p>
          <p className="text-base font-semibold text-white">Aún no tienes ventas</p>
          <p className="mt-1 text-sm text-white/40">Publica una entrada para empezar a vender</p>
          <Link
            href="/mis-publicaciones/nueva"
            className="mt-4 inline-block rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-bold text-gray-900 hover:opacity-90 transition-opacity shadow-[0_4px_16px_rgba(245,158,11,0.3)]"
          >
            Publicar entrada
          </Link>
        </div>
      )}
    </div>
  )
}
