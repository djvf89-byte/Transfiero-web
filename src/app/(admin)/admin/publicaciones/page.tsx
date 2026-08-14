import Link from "next/link"
import { listarPublicacionesAdmin } from "@/services/publicacion.service"
import { PublicacionCard } from "@/components/publicaciones/PublicacionCard"
import { logoutAction } from "@/app/actions/auth.actions"
import type { EstadoPublicacion } from "@prisma/client"

const ESTADOS_FILTRO: { value: string; label: string }[] = [
  { value: "", label: "Todas" },
  { value: "PENDIENTE_REVISION", label: "En revisión" },
  { value: "DISPONIBLE", label: "Disponibles" },
  { value: "BORRADOR", label: "Borradores" },
  { value: "CANCELADA", label: "Canceladas" },
  { value: "COMPLETADA", label: "Completadas" },
]

interface Props {
  searchParams: Promise<{ pagina?: string; estado?: string }>
}

export default async function AdminPublicacionesPage({ searchParams }: Props) {
  const { pagina: paginaParam, estado: estadoParam } = await searchParams
  const pagina = Math.max(1, parseInt(paginaParam ?? "1", 10))
  const estado = estadoParam as EstadoPublicacion | undefined

  const { publicaciones, total, totalPaginas } = await listarPublicacionesAdmin(pagina, estado)

  const baseUrl = estado ? `/admin/publicaciones?estado=${estado}` : "/admin/publicaciones"

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Header con navegación */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/50 hover:bg-white/8 hover:text-white transition-colors"
          >
            ← Volver
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Publicaciones</h1>
            <p className="text-sm text-white/40">{total} resultado{total !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/40 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-colors"
          >
            Cerrar sesión
          </button>
        </form>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-2">
        {ESTADOS_FILTRO.map((f) => {
          const activo = (estadoParam ?? "") === f.value
          const href = f.value
            ? `/admin/publicaciones?estado=${f.value}`
            : "/admin/publicaciones"
          return (
            <Link
              key={f.value}
              href={href}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                activo
                  ? "border border-amber-500/30 bg-amber-500/15 text-amber-400"
                  : "border border-white/10 bg-white/6 text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      {publicaciones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] p-12 text-center">
          <p className="text-sm text-white/40">No hay publicaciones con este filtro.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {publicaciones.map((pub) => (
            <div key={pub.id} className="space-y-1">
              <PublicacionCard
                id={pub.id}
                nombreEvento={pub.nombreEvento}
                fechaEvento={pub.fechaEvento}
                lugarEvento={pub.lugarEvento}
                precioVentaCentimos={pub.precioVentaCentimos}
                estado={pub.estado}
                imagenUrl={pub.evidencias[0]?.url}
                hasEvidencia={pub.evidencias.length > 0}
                href={`/admin/publicaciones/${pub.id}`}
              />
              <p className="pl-1 text-xs text-white/35">
                Vendedor: {pub.vendedor.nombre} · {pub.vendedor.email}
              </p>
            </div>
          ))}
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {pagina > 1 && (
            <Link
              href={`${baseUrl}&pagina=${pagina - 1}`}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white transition-colors"
            >
              ← Anterior
            </Link>
          )}
          <span className="text-sm text-white/30">
            Página {pagina} de {totalPaginas}
          </span>
          {pagina < totalPaginas && (
            <Link
              href={`${baseUrl}&pagina=${pagina + 1}`}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white transition-colors"
            >
              Siguiente →
            </Link>
          )}
        </div>
      )}
    </main>
  )
}
