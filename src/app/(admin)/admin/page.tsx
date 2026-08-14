import Link from "next/link"
import { obtenerMetricasAdmin } from "@/services/admin.service"

function fmt(centimos: number) {
  return `S/ ${(centimos / 100).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`
}

export default async function AdminDashboardPage() {
  const metricas = await obtenerMetricasAdmin()
  const colaConItems = metricas.cola.filter((c) => c.count > 0)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-white/40">Resumen operativo en tiempo real</p>
      </div>

      {/* Métricas */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/30">En custodia</p>
          <p className="mt-2 text-2xl font-extrabold text-amber-400">{fmt(metricas.montoCustodiaCentimos)}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/30">Ops activas</p>
          <p className="mt-2 text-2xl font-extrabold text-white">{metricas.operacionesActivas}</p>
        </div>
        <div className={`rounded-2xl border p-5 ${
          metricas.disputasAbiertas > 0
            ? "border-red-500/30 bg-red-500/8"
            : "border-white/8 bg-white/[0.04]"
        }`}>
          <p className={`text-xs font-semibold uppercase tracking-wider ${
            metricas.disputasAbiertas > 0 ? "text-red-400" : "text-white/30"
          }`}>Disputas</p>
          <p className={`mt-2 text-2xl font-extrabold ${
            metricas.disputasAbiertas > 0 ? "text-red-400" : "text-white"
          }`}>{metricas.disputasAbiertas}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/30">Completadas hoy</p>
          <p className="mt-2 text-2xl font-extrabold text-green-400">{metricas.completadasHoy}</p>
        </div>
      </div>

      {/* Cola de trabajo */}
      <div>
        <h2 className="mb-3 text-base font-bold text-white">Cola de trabajo</h2>
        {colaConItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] py-14 text-center">
            <p className="text-2xl mb-2">✓</p>
            <p className="text-white/50 font-medium">Sin tareas pendientes</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04]">
            <table className="w-full text-sm">
              <thead className="border-b border-white/8 bg-white/[0.03]">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/30">Tarea</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white/30">Pendientes</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white/30"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {colaConItems.map((item) => (
                  <tr key={item.estado} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {item.urgente && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]" />
                        )}
                        <span className={`font-medium ${item.urgente ? "text-white" : "text-white/55"}`}>
                          {item.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        item.urgente && item.count > 0
                          ? "border border-amber-500/30 bg-amber-500/10 text-amber-400"
                          : "border border-white/10 bg-white/8 text-white/50"
                      }`}>
                        {item.count}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={item.href} className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
