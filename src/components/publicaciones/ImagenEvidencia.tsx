"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { guardarEvidenciaAction } from "@/app/actions/publicacion.actions"

interface Props {
  publicacionId: string
  urlActual?: string
  onSubida?: (url: string) => void
}

export function ImagenEvidencia({ publicacionId, urlActual, onSubida }: Props) {
  const [preview, setPreview] = useState<string | null>(urlActual ?? null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setSubiendo(true)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("tipo", "publicaciones")

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Error al subir la imagen")
        return
      }

      const resultado = await guardarEvidenciaAction({
        publicacionId,
        url: data.url,
        cloudinaryId: data.cloudinaryId,
      })

      if (resultado?.error) {
        setError(resultado.error)
        return
      }

      setPreview(data.url)
      onSubida?.(data.url)
    } catch {
      setError("Error de conexión al subir la imagen")
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Imagen de la entrada
        <span className="ml-1 text-xs text-gray-500">(obligatoria para enviar a revisión)</span>
      </label>

      {preview ? (
        <div className="relative w-full max-w-sm">
          <Image
            src={preview}
            alt="Evidencia de entrada"
            width={400}
            height={250}
            className="rounded-lg border object-cover"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Cambiar imagen
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={subiendo}
          className="flex w-full max-w-sm cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-gray-400 disabled:opacity-50"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">
              {subiendo ? "Subiendo..." : "Haz clic para subir imagen"}
            </p>
            <p className="text-xs text-gray-500">JPG, PNG o WEBP · Máx. 5MB</p>
          </div>
        </button>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
