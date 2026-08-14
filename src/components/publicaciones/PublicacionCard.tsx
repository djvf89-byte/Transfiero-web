import Link from "next/link"
import { EstadoBadge } from "./EstadoBadge"
import { centimosToCurrency } from "@/utils/pricing"
import type { EstadoPublicacion } from "@prisma/client"

interface Props {
  id?: string
  nombreEvento: string
  fechaEvento: Date
  lugarEvento: string
  precioVentaCentimos: number
  estado: EstadoPublicacion
  imagenUrl?: string
  href: string
  hasEvidencia?: boolean
}

export function PublicacionCard({
  nombreEvento,
  fechaEvento,
  lugarEvento,
  precioVentaCentimos,
  estado,
  href,
  hasEvidencia,
}: Props) {
  const fecha = new Date(fechaEvento).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  return (
    <Link
      href={href}
      className="flex items-start gap-4 rounded-xl border border-white/8 bg-white/[0.04] p-4 transition hover:bg-white/[0.07] hover:border-white/15"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-white">{nombreEvento}</h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {hasEvidencia && (
              <span className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                Con evidencia
              </span>
            )}
            <EstadoBadge estado={estado} />
          </div>
        </div>
        <p className="mt-1 text-xs text-white/40">
          {fecha} · {lugarEvento}
        </p>
        <p className="mt-2 text-sm font-bold text-amber-400">
          {centimosToCurrency(precioVentaCentimos)}
        </p>
      </div>
    </Link>
  )
}
