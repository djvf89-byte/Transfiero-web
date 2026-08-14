import { auth } from "@/lib/auth"
import Link from "next/link"
import { listarOperacionesComprador } from "@/services/operacion.service"
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

export default async function MisComprasPage() {
  const session = await auth()
  const { operaciones } = await listarOperacionesComprador(session!.user.id)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white">Mis Compras</h1>
        <p className="mt-1 text-sm text-white/40">Historial de reservas y seguimiento de operaciones</p>
      </div>

      {operaciones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] py-16 text-center">
          <p className="text-3xl mb-3">🎟</p>
          <p className="text-base font-semibold text-white">Aún no tienes compras</p>
          <p className="mt-1 text-sm text-white/40">Explora el marketplace y reserva tu primera entrada</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-bold text-gray-900 hover:opacity-90 transition-opacity shadow-[0_4px_16px_rgba(245,158,11,0.3)]"
          >
            Ir al Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {operaciones.map((op) => {
            const requiereAccion =
              op.estado === "PAGO_PENDIENTE" ||
              op.estado === "PENDIENTE_CONFIRMACION_COMPRADOR" ||
              op.estado === "COMPRADOR_CONFIRMADO"
            const gradiente = GRADIENTE_CATEGORIA[op.publicacion.categoria] ?? GRADIENTE_CATEGORIA.OTRO
            const icono = ICONO_CATEGORIA[op.publicacion.categoria] ?? "🎟"

            return (
              <Link
                key={op.id}
                href={`/mis-compras/${op.id}`}
                className={`flex items-center gap-4 rounded-xl border p-4 transition hover:border-white/15 hover:bg-white/[0.06] ${
                  requiereAccion
                    ? "border-amber-500/25 bg-amber-500/8"
                    : "border-white/8 bg-white/[0.04]"
                }`}
              >
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradiente} text-2xl`}>
                  {icono}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="truncate font-bold text-white text-sm">
                    {op.publicacion.nombreEvento}
                  </p>
                  <p className="text-xs text-white/35 mt-0.5">
                    📅 {formatFecha(op.publicacion.fechaEvento)} · {op.publicacion.lugarEvento}
                  </p>
                  <div className="mt-1.5">
                    <EstadoBadge estado={op.estado} vista="comprador" />
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-extrabold text-white text-base">
                    S/ {(op.montoCompradorCentimos / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-white/30 mt-0.5">{formatFecha(op.creadoEn)}</p>
                  {requiereAccion && (
                    <p className="mt-1 text-xs font-semibold text-amber-400">Acción →</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
