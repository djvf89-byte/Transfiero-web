import type { Metadata } from "next"
import { Suspense } from "react"
import { HeroMarketplace } from "@/components/marketplace/HeroMarketplace"

export const metadata: Metadata = {
  title: "Compra entradas en Perú — Marketplace seguro",
  description:
    "Encuentra entradas para conciertos, deportes, festivales y teatro en Perú. Compra con custodia escrow. Sin riesgos, sin estafas.",
  alternates: { canonical: "/entradas" },
  openGraph: {
    title: "Entradas en Perú — Marketplace Transfiero",
    description: "Conciertos, deportes, festivales y teatro. Compra con pago en custodia.",
    url: "/entradas",
  },
}
import { EscrowVisual } from "@/components/marketplace/EscrowVisual"
import { FiltrosMarketplace } from "@/components/marketplace/FiltrosMarketplace"
import { EntradaCard } from "@/components/marketplace/EntradaCard"
import { listarMarketplace, type OrdenMarketplace } from "@/services/publicacion.service"
import type { CategoriaEvento } from "@prisma/client"

const CATEGORIAS_VALIDAS: CategoriaEvento[] = ["CONCIERTO", "DEPORTE", "FESTIVAL", "TEATRO", "OTRO"]
const ORDENES_VALIDOS: OrdenMarketplace[] = ["reciente", "precio_asc", "precio_desc", "fecha_evento"]

interface PageProps {
  searchParams: Promise<{ categoria?: string; orden?: string; pagina?: string }>
}

export default async function EntradasPage({ searchParams }: PageProps) {
  const params = await searchParams
  const categoria = CATEGORIAS_VALIDAS.includes(params.categoria as CategoriaEvento)
    ? (params.categoria as CategoriaEvento)
    : undefined
  const orden = ORDENES_VALIDOS.includes(params.orden as OrdenMarketplace)
    ? (params.orden as OrdenMarketplace)
    : "reciente"
  const pagina = Math.max(1, parseInt(params.pagina ?? "1", 10))

  const { publicaciones, total, totalPaginas } = await listarMarketplace(pagina, categoria, orden)

  return (
    <>
      <HeroMarketplace featured={publicaciones[0] ?? null} />

      <div className="mx-auto max-w-7xl space-y-10 px-4 pb-24 sm:px-6 lg:px-8">
        <EscrowVisual />

        <Suspense>
          <FiltrosMarketplace total={total} basePath="/entradas" />
        </Suspense>

        {publicaciones.length === 0 ? (
          <div className="py-20 text-center">
            <p className="mb-4 text-4xl">🎟</p>
            <p className="text-lg font-semibold text-white/60">No hay entradas disponibles</p>
            <p className="mt-1 text-sm text-white/30">Vuelve pronto o cambia los filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {publicaciones.map((pub) => (
              <EntradaCard
                key={pub.id}
                id={pub.id}
                nombreEvento={pub.nombreEvento}
                fechaEvento={pub.fechaEvento}
                lugarEvento={pub.lugarEvento}
                categoria={pub.categoria}
                precioVentaCentimos={pub.precioVentaCentimos}
                estado={pub.estado}
                imagenPortadaUrl={pub.imagenPortadaUrl}
                imagenEvidenciaUrl={pub.evidencias[0]?.url}
                vendedorNombre={pub.vendedor.nombre}
              />
            ))}
          </div>
        )}

        {totalPaginas > 1 && (
          <div className="flex justify-center gap-2 pt-4">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => {
              const sp = new URLSearchParams()
              if (categoria) sp.set("categoria", categoria)
              if (orden !== "reciente") sp.set("orden", orden)
              if (p > 1) sp.set("pagina", String(p))
              return (
                <a
                  key={p}
                  href={`/entradas?${sp.toString()}`}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                    p === pagina
                      ? "bg-amber-500 text-gray-900 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                      : "border border-white/10 bg-white/4 text-white/50 hover:border-white/20 hover:text-white/80"
                  }`}
                >
                  {p}
                </a>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
