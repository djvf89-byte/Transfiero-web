import Link from "next/link"
import { listarSolicitudesAdmin } from "@/services/solicitud.service"
import type { EstadoSolicitud } from "@prisma/client"

const ESTADO_CONFIG: Record<EstadoSolicitud, { label: string; color: string }> = {
  PENDIENTE: { label: "Pendiente", color: "bg-amber-100 text-amber-800" },
  APROBADA: { label: "Aprobada", color: "bg-green-100 text-green-800" },
  RECHAZADA: { label: "Rechazada", color: "bg-red-100 text-red-700" },
}

function formatFecha(fecha: Date) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(fecha))
}

interface PageProps {
  searchParams: Promise<{ estado?: string }>
}

const ESTADOS_VALIDOS: EstadoSolicitud[] = ["PENDIENTE", "APROBADA", "RECHAZADA"]

export default async function AdminVendedoresPage({ searchParams }: PageProps) {
  const params = await searchParams
  const filtro = ESTADOS_VALIDOS.includes(params.estado as EstadoSolicitud)
    ? (params.estado as EstadoSolicitud)
    : undefined

  const solicitudes = await listarSolicitudesAdmin(filtro)
  const pendientes = solicitudes.filter((s) => s.estado === "PENDIENTE").length

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Verificaciones de vendedor</h1>
          {pendientes > 0 && (
            <p className="mt-1 text-sm text-amber-600 font-semibold">
              {pendientes} solicitud{pendientes !== 1 ? "es" : ""} pendiente{pendientes !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex gap-2">
        {([undefined, "PENDIENTE", "APROBADA", "RECHAZADA"] as const).map((estado) => {
          const label = estado
            ? ESTADO_CONFIG[estado].label
            : "Todas"
          const href = estado ? `/admin/vendedores?estado=${estado}` : "/admin/vendedores"
          const activo = filtro === estado
          return (
            <Link
              key={label}
              href={href}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                activo
                  ? "bg-[#1B3A6B] text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-gray-400"
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {solicitudes.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
          <p className="text-gray-400">No hay solicitudes en esta categoría</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Usuario</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Estado</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Enviada</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {solicitudes.map((s) => {
                const cfg = ESTADO_CONFIG[s.estado]
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-900">{s.usuario.nombre}</p>
                      <p className="text-xs text-gray-400">{s.usuario.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{formatFecha(s.creadoEn)}</td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/vendedores/${s.id}`}
                        className="text-xs font-semibold text-[#1B3A6B] hover:underline"
                      >
                        Revisar →
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
