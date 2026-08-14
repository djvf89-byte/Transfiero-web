"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import type { CategoriaEvento, EstadoPublicacion } from "@prisma/client"

const GRADIENTE_CATEGORIA: Record<CategoriaEvento, string> = {
  CONCIERTO: "from-indigo-950 via-blue-900 to-violet-900",
  DEPORTE: "from-emerald-950 via-green-900 to-teal-900",
  FESTIVAL: "from-purple-950 via-violet-900 to-fuchsia-900",
  TEATRO: "from-amber-950 via-orange-900 to-red-900",
  OTRO: "from-slate-900 via-slate-800 to-slate-700",
}

const ICONO_CATEGORIA: Record<CategoriaEvento, string> = {
  CONCIERTO: "🎵",
  DEPORTE: "⚽",
  FESTIVAL: "🎪",
  TEATRO: "🎭",
  OTRO: "🎟",
}

const LABEL_CATEGORIA: Record<CategoriaEvento, string> = {
  CONCIERTO: "Concierto",
  DEPORTE: "Deporte",
  FESTIVAL: "Festival",
  TEATRO: "Teatro",
  OTRO: "Evento",
}

function BadgeEstado({ estado }: { estado: EstadoPublicacion }) {
  if (estado === "DISPONIBLE") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-500/25 bg-green-500/15 px-2 py-0.5 text-[10px] font-bold text-green-400">
        <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_4px_#4ADE80]" />
        Disponible
      </span>
    )
  }
  if (estado === "PENDIENTE_VENDEDOR" || estado === "RESERVADA") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/25 bg-orange-500/15 px-2 py-0.5 text-[10px] font-bold text-orange-400">
        <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
        Reservada
      </span>
    )
  }
  return null
}

function formatFecha(fecha: Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(fecha))
}

function diasHastaEvento(fechaEvento: Date): number {
  const ahora = new Date()
  const diff = new Date(fechaEvento).getTime() - ahora.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

interface Props {
  id: string
  nombreEvento: string
  fechaEvento: Date
  lugarEvento: string
  categoria: CategoriaEvento
  precioVentaCentimos: number
  estado: EstadoPublicacion
  imagenPortadaUrl?: string | null
  imagenEvidenciaUrl?: string | null
  vendedorNombre?: string
}

export function EntradaCard({
  id,
  nombreEvento,
  fechaEvento,
  lugarEvento,
  categoria,
  precioVentaCentimos,
  estado,
  imagenPortadaUrl,
  imagenEvidenciaUrl,
  vendedorNombre: _vendedorNombre,
}: Props) {
  const disponible = estado === "DISPONIBLE"
  const dias = diasHastaEvento(fechaEvento)
  const urgente = dias <= 7 && dias >= 0
  const precio = (precioVentaCentimos / 100).toFixed(2)
  const imagenUrl = imagenPortadaUrl ?? imagenEvidenciaUrl
  const [imgError, setImgError] = useState(false)

  return (
    <Link
      href={`/entradas/${id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/7 bg-white/[0.03] transition-all duration-200 hover:-translate-y-1 hover:border-amber-500/20 hover:bg-white/[0.05] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
    >
      {/* Imagen / Gradiente */}
      <div className="relative h-32 shrink-0">
        {imagenUrl && !imgError ? (
          <Image
            src={imagenUrl}
            alt={nombreEvento}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${GRADIENTE_CATEGORIA[categoria]}`}
          >
            <span className="text-4xl opacity-25">{ICONO_CATEGORIA[categoria]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05091A]/80 to-transparent" />

        {/* Categoría */}
        <div className="absolute left-2.5 top-2.5 rounded-md bg-black/35 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-white/75 backdrop-blur-sm">
          {LABEL_CATEGORIA[categoria]}
        </div>

        {/* Badge urgencia */}
        {urgente && disponible && (
          <div className="absolute right-2.5 top-2.5 rounded-full bg-red-500 px-2 py-0.5 text-[9.5px] font-bold text-white">
            ⚡ {dias === 0 ? "¡Hoy!" : dias === 1 ? "¡Mañana!" : `${dias}d`}
          </div>
        )}

        {/* Estado */}
        <div className="absolute bottom-2.5 left-2.5">
          <BadgeEstado estado={estado} />
        </div>
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 line-clamp-2 text-[14px] font-bold leading-snug tracking-tight text-white/90 group-hover:text-white transition-colors">
          {nombreEvento}
        </h3>
        <div className="flex flex-col gap-1 text-xs text-white/35 mb-3">
          <span>📅 {formatFecha(fechaEvento)}</span>
          <span className="truncate">📍 {lugarEvento}</span>
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-white/6 pt-3">
          <div>
            <p className="text-[10px] text-white/25">Precio entrada</p>
            <p className="text-[19px] font-extrabold tracking-tight text-amber-400">
              S/ {precio}
            </p>
          </div>
          {disponible ? (
            <span className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-gray-900 shadow-[0_0_12px_rgba(245,158,11,0.2)] group-hover:bg-amber-400 transition-colors">
              Reservar
            </span>
          ) : (
            <span className="rounded-lg border border-white/8 px-3 py-2 text-xs font-semibold text-white/25 cursor-not-allowed">
              Reservada
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
