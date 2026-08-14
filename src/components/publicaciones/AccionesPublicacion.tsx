"use client"

import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import {
  enviarARevisionAction,
  cancelarPublicacionAction,
} from "@/app/actions/publicacion.actions"

interface Props {
  id: string
  puedeEnviar: boolean
  puedeCancelar: boolean
  tieneImagen: boolean
}

export function AccionesPublicacion({ id, puedeEnviar, puedeCancelar, tieneImagen }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (!puedeEnviar && !puedeCancelar) return null

  function handleEnviar() {
    setError(null)
    startTransition(async () => {
      const res = await enviarARevisionAction(id)
      if (res?.error) { setError(res.error); return }
      router.refresh()
    })
  }

  function handleCancelar() {
    if (!confirm("¿Seguro que quieres cancelar esta publicación?")) return
    setError(null)
    startTransition(async () => {
      const res = await cancelarPublicacionAction(id)
      if (res?.error) { setError(res.error); return }
      router.push("/mis-publicaciones")
    })
  }

  return (
    <div className="mt-8 space-y-3 border-t border-gray-200 pt-6">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-3">
        {puedeEnviar && (
          <button
            onClick={handleEnviar}
            disabled={isPending || !tieneImagen}
            title={!tieneImagen ? "Sube una imagen de la entrada primero" : undefined}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Enviando..." : "Enviar a revisión"}
          </button>
        )}
        {puedeCancelar && (
          <button
            onClick={handleCancelar}
            disabled={isPending}
            className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Cancelar publicación
          </button>
        )}
      </div>
      {puedeEnviar && !tieneImagen && (
        <p className="text-xs text-amber-700">
          Debes subir al menos una imagen de la entrada para poder enviar a revisión.
        </p>
      )}
    </div>
  )
}
