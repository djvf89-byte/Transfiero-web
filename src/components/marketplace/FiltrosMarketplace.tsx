"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

const CATEGORIAS = [
  { value: "", label: "Todos", icono: "🎟" },
  { value: "CONCIERTO", label: "Conciertos", icono: "🎵" },
  { value: "DEPORTE", label: "Deportes", icono: "⚽" },
]

const ORDENES = [
  { value: "reciente", label: "Más recientes" },
  { value: "precio_asc", label: "Menor precio" },
  { value: "precio_desc", label: "Mayor precio" },
  { value: "fecha_evento", label: "Fecha del evento" },
]

interface Props {
  total: number
  basePath?: string
}

export function FiltrosMarketplace({ total, basePath = "/" }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const categoriaActual = params.get("categoria") ?? ""
  const ordenActual = params.get("orden") ?? "reciente"

  const actualizar = useCallback(
    (key: string, value: string) => {
      const p = new URLSearchParams(params.toString())
      if (value) {
        p.set(key, value)
      } else {
        p.delete(key)
      }
      p.delete("pagina")
      const qs = p.toString()
      router.push(qs ? `${basePath}?${qs}` : basePath)
    },
    [params, router, basePath]
  )

  return (
    <div id="entradas" className="space-y-4">
      {/* Chips de categoría */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.value}
            onClick={() => actualizar("categoria", cat.value)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
              categoriaActual === cat.value
                ? "border-amber-500/40 bg-amber-500/12 text-amber-400"
                : "border-white/8 bg-white/3 text-white/50 hover:border-white/15 hover:text-white/80"
            }`}
          >
            {cat.icono} {cat.label}
          </button>
        ))}
      </div>

      {/* Conteo + orden */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/35">
          <span className="font-bold text-white/65">{total}</span>{" "}
          {total === 1 ? "entrada disponible" : "entradas disponibles"}
        </p>
        <select
          value={ordenActual}
          onChange={(e) => actualizar("orden", e.target.value)}
          className="rounded-lg border border-white/8 bg-[#05091A] px-3 py-1.5 text-sm text-white/55 focus:border-amber-500/40 focus:outline-none"
        >
          {ORDENES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
