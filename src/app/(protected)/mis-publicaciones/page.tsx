import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { listarPublicacionesVendedor } from "@/services/publicacion.service"
import { PublicacionCard } from "@/components/publicaciones/PublicacionCard"

interface Props {
  searchParams: Promise<{ pagina?: string }>
}

export default async function MisPublicacionesPage({ searchParams }: Props) {
  const session = await auth()
  if (!session) redirect("/auth/login")
  if (
    session.user.rolPrincipal !== "VENDEDOR" ||
    session.user.estadoVendedor !== "APROBADO"
  ) {
    redirect("/403")
  }

  const { pagina: paginaParam } = await searchParams
  const pagina = Math.max(1, parseInt(paginaParam ?? "1", 10))

  const { publicaciones, total, totalPaginas } = await listarPublicacionesVendedor(
    session.user.id,
    pagina
  )

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Mis Publicaciones</h1>
          <p className="mt-1 text-sm text-white/40">{total} publicación{total !== 1 ? "es" : ""}</p>
        </div>
        <Link
          href="/mis-publicaciones/nueva"
          className="rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-bold text-gray-900 hover:opacity-90 transition-opacity shadow-[0_4px_16px_rgba(245,158,11,0.3)]"
        >
          + Nueva publicación
        </Link>
      </div>

      {publicaciones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] py-16 text-center">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-base font-semibold text-white">Aún no tienes publicaciones</p>
          <p className="mt-1 text-sm text-white/40">Publica tu primera entrada y llega a compradores verificados</p>
          <Link
            href="/mis-publicaciones/nueva"
            className="mt-5 inline-block rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-bold text-gray-900 hover:opacity-90 transition-opacity shadow-[0_4px_16px_rgba(245,158,11,0.3)]"
          >
            + Publicar entrada
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {publicaciones.map((pub) => (
            <PublicacionCard
              key={pub.id}
              id={pub.id}
              nombreEvento={pub.nombreEvento}
              fechaEvento={pub.fechaEvento}
              lugarEvento={pub.lugarEvento}
              precioVentaCentimos={pub.precioVentaCentimos}
              estado={pub.estado}
              imagenUrl={pub.evidencias[0]?.url}
              href={`/mis-publicaciones/${pub.id}`}
            />
          ))}
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {pagina > 1 && (
            <Link
              href={`/mis-publicaciones?pagina=${pagina - 1}`}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white transition-colors"
            >
              ← Anterior
            </Link>
          )}
          <span className="text-sm text-white/30">
            {pagina} / {totalPaginas}
          </span>
          {pagina < totalPaginas && (
            <Link
              href={`/mis-publicaciones?pagina=${pagina + 1}`}
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
