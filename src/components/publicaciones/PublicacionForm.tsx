"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { crearPublicacionAction, editarPublicacionAction } from "@/app/actions/publicacion.actions"
import { ImagenEvidencia } from "./ImagenEvidencia"
import { PortadaEvento } from "./PortadaEvento"
import { TicketeraSelect } from "./TicketeraSelect"
import type { Publicacion } from "@prisma/client"

const CATEGORIAS = [
  { value: "CONCIERTO", label: "Concierto" },
  { value: "DEPORTE", label: "Deporte" },
  { value: "FESTIVAL", label: "Festival" },
  { value: "TEATRO", label: "Teatro" },
  { value: "OTRO", label: "Otro" },
]

const INPUT = "mt-1 block w-full rounded-xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-amber-500/60 focus:bg-white/8"
const LABEL = "block text-xs font-semibold uppercase tracking-wider text-white/40"

interface Props {
  publicacion?: Publicacion & {
    evidencias?: { url: string }[]
    imagenPortadaUrl?: string | null
    artista?: string | null
    spotifyEmbedUrl?: string | null
  }
  modo: "crear" | "editar"
}

export function PublicacionForm({ publicacion, modo }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [precioMax, setPrecioMax] = useState<number | null>(
    publicacion ? publicacion.precioOriginalCentimos / 100 * 1.1 : null
  )
  const formRef = useRef<HTMLFormElement>(null)

  function handlePrecioOriginalChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value)
    setPrecioMax(isNaN(val) ? null : Math.round(val * 1.1 * 100) / 100)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const resultado =
        modo === "crear"
          ? await crearPublicacionAction(formData)
          : await editarPublicacionAction(publicacion!.id, formData)

      if (resultado?.error) {
        setError(resultado.error)
        return
      }

      if (modo === "crear" && resultado && "id" in resultado && resultado.id) {
        router.push(`/mis-publicaciones/${resultado.id}`)
      } else {
        router.refresh()
      }
    })
  }

  const valorFechaEvento = publicacion?.fechaEvento
    ? new Date(publicacion.fechaEvento).toISOString().slice(0, 16)
    : ""

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {/* Datos del evento */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5 space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-white/30">Datos del evento</p>

        <div>
          <label className={LABEL}>Nombre del evento <span className="text-red-400">*</span></label>
          <input
            name="nombreEvento"
            defaultValue={publicacion?.nombreEvento}
            required
            className={INPUT}
            placeholder="Ej: Bad Bunny - World's Hottest Tour"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL}>Fecha y hora <span className="text-red-400">*</span></label>
            <input
              name="fechaEvento"
              type="datetime-local"
              defaultValue={valorFechaEvento}
              required
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL}>Categoría <span className="text-red-400">*</span></label>
            <select
              name="categoria"
              defaultValue={publicacion?.categoria ?? ""}
              required
              className={INPUT}
            >
              <option value="" disabled className="bg-[#0d1224]">Selecciona una categoría</option>
              {CATEGORIAS.map((c) => (
                <option key={c.value} value={c.value} className="bg-[#0d1224]">{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={LABEL}>Lugar del evento <span className="text-red-400">*</span></label>
          <input
            name="lugarEvento"
            defaultValue={publicacion?.lugarEvento}
            required
            className={INPUT}
            placeholder="Ej: Estadio Nacional, Lima"
          />
        </div>
      </div>

      {/* Precios */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5 space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-white/30">Precios</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL}>Precio original (S/) <span className="text-red-400">*</span></label>
            <input
              name="precioOriginalSoles"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={publicacion ? (publicacion.precioOriginalCentimos / 100).toFixed(2) : ""}
              required
              onChange={handlePrecioOriginalChange}
              className={INPUT}
              placeholder="200.00"
            />
          </div>
          <div>
            <label className={LABEL}>Precio de venta (S/) <span className="text-red-400">*</span></label>
            <input
              name="precioVentaSoles"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={publicacion ? (publicacion.precioVentaCentimos / 100).toFixed(2) : ""}
              required
              className={INPUT}
              placeholder="200.00"
            />
            {precioMax !== null && (
              <p className="mt-1.5 text-xs text-white/35">
                Máximo: S/ {precioMax.toFixed(2)} (110% del precio original)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Datos de la entrada */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5 space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-white/30">Detalles de la entrada</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL}>Zona / Sector</label>
            <input name="zona" defaultValue={publicacion?.zona ?? ""} className={INPUT} placeholder="Ej: Platea Norte" />
          </div>
          <div>
            <label className={LABEL}>Asiento</label>
            <input name="asiento" defaultValue={publicacion?.asiento ?? ""} className={INPUT} placeholder="Ej: F12" />
          </div>
        </div>
        <div>
          <label className={LABEL}>Descripción</label>
          <textarea
            name="descripcion"
            defaultValue={publicacion?.descripcion ?? ""}
            rows={3}
            maxLength={500}
            className={INPUT}
            placeholder="Información adicional sobre la entrada..."
          />
        </div>
      </div>

      {/* Ticketera — campo obligatorio con instrucciones dinámicas */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-white/30">Ticketera</p>
        <TicketeraSelect defaultValue={publicacion?.ticketeraEnum} />
      </div>

      {/* Imágenes — solo en edición */}
      {modo === "editar" && publicacion && (
        <>
          <PortadaEvento publicacionId={publicacion.id} urlActual={publicacion.imagenPortadaUrl} />
          <ImagenEvidencia publicacionId={publicacion.id} urlActual={publicacion.evidencias?.[0]?.url} />
        </>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-gray-900 hover:bg-amber-400 disabled:opacity-50 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.25)]"
        >
          {isPending ? "Guardando..." : modo === "crear" ? "Guardar borrador" : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
