import Link from "next/link"
import { listarOperacionesAdmin } from "@/services/operacion.service"
import type { EstadoOperacion } from "@prisma/client"

const ESTADO_CONFIG: Record<EstadoOperacion, { label: string; color: string; urgente?: boolean }> = {
  ESPERANDO_VENDEDOR:                   { label: "Esperando vendedor",       color: "bg-amber-100 text-amber-800",   urgente: true },
  PAGO_PENDIENTE:                       { label: "Pago pendiente",           color: "bg-yellow-100 text-yellow-800", urgente: true },
  PAGO_RECIBIDO:                        { label: "Pago recibido",            color: "bg-blue-100 text-blue-800",     urgente: true },
  VENDEDOR_NOTIFICADO:                  { label: "Vendedor notificado",      color: "bg-purple-100 text-purple-800" },
  TRANSFERENCIA_EN_PROCESO:             { label: "Transferencia en proceso", color: "bg-indigo-100 text-indigo-800", urgente: true },
  PENDIENTE_CONFIRMACION_COMPRADOR:     { label: "Pendiente confirmación",   color: "bg-orange-100 text-orange-800", urgente: true },
  COMPRADOR_CONFIRMADO:                 { label: "Comprador confirmó",       color: "bg-green-100 text-green-800",   urgente: true },
  FONDOS_LIBERADOS:                     { label: "Fondos liberados",         color: "bg-gray-100 text-gray-600" },
  REEMBOLSADA:                          { label: "Reembolsada",              color: "bg-gray-100 text-gray-600" },
  EN_DISPUTA:                           { label: "En disputa",               color: "bg-red-100 text-red-700",       urgente: true },
  CANCELADA:                            { label: "Cancelada",                color: "bg-gray-100 text-gray-500" },
}

const FILTROS: { label: string; valor: string | undefined }[] = [
  { label: "Activas", valor: undefined },
  { label: "Esperando vendedor", valor: "ESPERANDO_VENDEDOR" },
  { label: "Pago pendiente", valor: "PAGO_PENDIENTE" },
  { label: "Pago recibido", valor: "PAGO_RECIBIDO" },
  { label: "Transferencia", valor: "TRANSFERENCIA_EN_PROCESO" },
  { label: "Pendiente confirm.", valor: "PENDIENTE_CONFIRMACION_COMPRADOR" },
  { label: "Confirmadas", valor: "COMPRADOR_CONFIRMADO" },
  { label: "Disputas", valor: "EN_DISPUTA" },
]

const ESTADOS_ACTIVOS: EstadoOperacion[] = [
  "ESPERANDO_VENDEDOR", "PAGO_PENDIENTE", "PAGO_RECIBIDO",
  "VENDEDOR_NOTIFICADO", "TRANSFERENCIA_EN_PROCESO",
  "PENDIENTE_CONFIRMACION_COMPRADOR", "COMPRADOR_CONFIRMADO", "EN_DISPUTA",
]

function formatFecha(fecha: Date) {
  return new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(fecha))
}

function formatMonto(centimos: number) {
  return `S/ ${(centimos / 100).toFixed(2)}`
}

interface PageProps {
  searchParams: Promise<{ estado?: string; q?: string }>
}

export default async function AdminOperacionesPage({ searchParams }: PageProps) {
  const { estado, q } = await searchParams
  const filtroActivo = ESTADOS_ACTIVOS.includes(estado as EstadoOperacion) ? estado : undefined
  const busqueda = q?.trim() || undefined

  const todasLasOps = await listarOperacionesAdmin(filtroActivo, busqueda)
  const operaciones = (filtroActivo || busqueda)
    ? todasLasOps
    : todasLasOps.filter((o) => ESTADOS_ACTIVOS.includes(o.estado as EstadoOperacion))

  const urgentes = operaciones.filter((o) => ESTADO_CONFIG[o.estado as EstadoOperacion]?.urgente).length

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Operaciones</h1>
          {urgentes > 0 && !busqueda && (
            <p className="mt-1 text-sm text-amber-600 font-semibold">
              {urgentes} operación{urgentes !== 1 ? "es" : ""} requiere{urgentes !== 1 ? "n" : ""} acción
            </p>
          )}
        </div>

        {/* Buscador por ID / nombre / partes */}
        <form method="GET" action="/admin/operaciones" className="flex items-center gap-2">
          <div className="relative">
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="ID de operación, evento o usuario…"
              autoComplete="off"
              className="w-72 rounded-xl border border-gray-200 bg-white px-4 py-2 pr-10 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#1B3A6B] focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
            />
            {q && (
              <Link
                href="/admin/operaciones"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
                title="Limpiar búsqueda"
              >
                ×
              </Link>
            )}
          </div>
          <button
            type="submit"
            className="rounded-xl bg-[#1B3A6B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#152d54] transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Resultado de búsqueda */}
      {busqueda && (
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
          <span>Resultados para <span className="font-semibold text-gray-800">&ldquo;{busqueda}&rdquo;</span></span>
          <span className="text-gray-400">— {operaciones.length} encontradas</span>
          <Link href="/admin/operaciones" className="ml-2 text-xs text-[#1B3A6B] hover:underline">
            Limpiar →
          </Link>
        </div>
      )}

      {/* Filtros — solo si no hay búsqueda activa */}
      {!busqueda && (
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTROS.map((f) => {
            const href = f.valor ? `/admin/operaciones?estado=${f.valor}` : "/admin/operaciones"
            const activo = filtroActivo === f.valor
            return (
              <Link
                key={f.label}
                href={href}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  activo
                    ? "bg-[#1B3A6B] text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                }`}
              >
                {f.label}
              </Link>
            )
          })}
        </div>
      )}

      {operaciones.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
          <p className="text-gray-400">
            {busqueda ? `Sin resultados para "${busqueda}"` : "No hay operaciones en esta categoría"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Evento</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Partes</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Monto</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Fecha</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {operaciones.map((op) => {
                const cfg = ESTADO_CONFIG[op.estado as EstadoOperacion]
                return (
                  <tr key={op.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 truncate max-w-[160px]">{op.publicacion.nombreEvento}</p>
                      <p className="text-xs text-gray-400">{formatFecha(op.publicacion.fechaEvento)}</p>
                      <p className="text-[10px] text-gray-300 font-mono mt-0.5 truncate max-w-[160px]">{op.id}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      <p>C: {op.comprador.nombre.split(" ")[0]}</p>
                      <p>V: {op.vendedor.nombre.split(" ")[0]}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg?.color}`}>
                        {cfg?.urgente && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                        {cfg?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      {formatMonto(op.montoCompradorCentimos)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-400">
                      {formatFecha(op.creadoEn)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/operaciones/${op.id}`}
                        className="text-xs font-semibold text-[#1B3A6B] hover:underline"
                      >
                        Gestionar →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
